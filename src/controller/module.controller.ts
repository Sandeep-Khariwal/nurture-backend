import { clientRequest, toStringParam } from "../middleware/jwtToken";
import { ChapterService } from "../services/chapter.services";
import { ModuleService } from "../services/module.service";
import { Request, Response } from "express";
import { QuestionService } from "../services/question.service";
import { ResultService } from "../services/result.service";
import { StudentService } from "../services/student.service";
import { ModuleType } from "../enums/test.enum";
import { ExamService } from "../services/exam.service";
import mongoose from "mongoose";
import {
  IsProModulesAccessible,
  IsSubscriptionExpired,
} from "../HelperFunction";
import fs from "fs/promises";
import { uploadMediaFile } from "../aws/awsHelper";

export const CreateModule = async (req: Request, res: Response) => {
  const { module, moduleId, moduleType } = req.body;

  const moduleService = new ModuleService();
  const chapterService = new ChapterService();
  const examService = new ExamService();

  let response;
  if (moduleId) {
    response = await moduleService.updateModuleById(moduleId, module);
  } else {
    response = await moduleService.createModule(module);
  }

  if (response["status"] === 200) {
    // update module in chapter
    if (!moduleId) {
      if (ModuleType.QUESTION_FIELD === moduleType) {
        await chapterService.addNewModuleInChapter(
          module.chapterId,
          response["module"]._id
        );
      } else if (ModuleType.MINI_TEST === moduleType) {
        // add modules in exam mini_test_modiles
        await examService.addMiniTestModules(
          module.examId,
          response["module"]._id
        );
      } else {
        // add modules in exam mock_drills_modiles
        await examService.addMockDrillsModules(
          module.examId,
          response["module"]._id
        );
      }
    }
    res.status(response["status"]).json({
      status: 200,
      data: { module: response["module"] },
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetAllModules = async (req: clientRequest, res: Response) => {
  const chapterId = toStringParam(req.query.chapterId);
  const moduleType = toStringParam(req.query.moduleType);
  const examId = toStringParam(req.query.examId);

  const studentId = req.user._id;
  const moduleService = new ModuleService();
  const examService = new ExamService();
  const studentService = new StudentService();

  //get mintiTest and mockDrill instructions of exam

  const examResp = await examService.getExamById(examId);
  let instructions: any = {};

  if (examResp["status"] === 200) {
    const miniTestInstructions =
      examResp["exam"].toObject().miniTestInstructions;
    const mockDrillInstructions =
      examResp["exam"].toObject().mockDrillInstructions;

    instructions.miniTestInstructions = miniTestInstructions;
    instructions.mockDrillInstructions = mockDrillInstructions;
  }

  let response;
  let modules = [];

  if (!chapterId && !examId && moduleType) {
    response = await moduleService.getAllModulesByModuleType(
      studentId,
      moduleType
    );

    if (response["status"] === 200) {
      modules = response["modules"].map((m: any) => {
        const { examId, ...rest } = m;
        return {
          ...rest,
          exam: examId,
        };
      });
    } else {
      res
        .status(response["status"])
        .json({ status: response["status"], message: response["message"] });
    }
  } else if (chapterId || ModuleType.QUESTION_FIELD === moduleType) {
    response = await moduleService.getAllModulesByChapterId(
      chapterId,
      studentId
    );

    modules = response["modules"];
  } else if (examId) {
    if (!moduleType && examId) {
      response = await moduleService.getAllModulesByExamId(examId, studentId);
      if (response["status"] === 200) {
        modules = response["modules"];
      }
    }

    if (ModuleType.MINI_TEST === moduleType) {
      response = await examService.getAllMiniTestModulesFromExam(
        examId,
        studentId
      );
      if (response["status"] === 200) {
        modules = response["modules"];
      }
    } else if (ModuleType.MOCK_DRILLS === moduleType) {
      response = await examService.getAllMockDrillModulesFromExam(
        examId,
        studentId
      );
      if (response["status"] === 200) {
        modules = response["modules"];
      }
    }
  } else {
    response = await moduleService.getAllModules(studentId);
    modules = response["modules"];
  }

  // checking subscription
  const studentSubscriptionResp = await studentService.getStudentById(
    studentId
  );

  let studentSubscription = null;
  let isProModulesAccessible = false;

  if (studentSubscriptionResp["status"] === 200) {
    //found subscription for current exam
    const currentSubscription = studentSubscriptionResp[
      "user"
    ]?.subscriptions.find((subs: any) => subs.examId === examId);
    const studentService = new StudentService();
    //if subscription expired? then update in db
    const isSubscriptionExpired = IsSubscriptionExpired(currentSubscription);
    if (isSubscriptionExpired) {
      const examId = currentSubscription.examId
      await studentService.expireStudentPlan(studentId,examId);
    }
    isProModulesAccessible = IsProModulesAccessible(
      studentSubscriptionResp["user"],
      examId
    );
  }
  if (isProModulesAccessible) {
    modules = modules.map((mod: any) => {
      return {
        ...mod,
        isPro: false,
      };
    });
  }

  if (response["status"] === 200) {
    res
      .status(response["status"])
      .json({ status: 200, data: { ...instructions, modules: modules } });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetAllCompletedModules = async (
  req: clientRequest,
  res: Response
) => {
  const examId = req.params.id;
  const studentId = req.user._id;

  const modulesService = new ModuleService();

  const response = await modulesService.getCompletedModulesByExamId(
    examId,
    studentId
  );

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: { modules: response["modules"] },
      message: response["message"],
    });
  } else {
    res.status(response["status"]).json({
      status: response["status"],
      message: response["message"],
    });
  }
};
export const GetAllVideos = async (req: clientRequest, res: Response) => {
  const { id } = req.params; 
     const search = toStringParam(req.query.search);

  const modulesService = new ModuleService();

  const response = await modulesService.getAllModulesVideos(id,search);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: response["module"],
      message: response["message"],
    });
  } else {
    res.status(response["status"]).json({
      status: response["status"],
      message: response["message"],
    });
  }
};

export const GetAllQuetionFieldModules = async (
  req: clientRequest,
  res: Response
) => {
  const { id } = req.params;
  const { examId } = req.body;
  const studentId = req.user._id;
  const moduleService = new ModuleService();

  const response = await moduleService.getAllModulesByChapterId(id, studentId);

  if (response["status"] === 200) {
    res
      .status(response["status"])
      .json({ status: 200, data: { modules: response["modules"] } });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const SubmitModuleResponse = async (
  req: clientRequest,
  res: Response
) => {
  const { id } = req.params;
  const studentId = req.user._id;

  const moduleService = new ModuleService();

  const response = await moduleService.submitModuleById(id, studentId);

  if (response["status"] === 200) {
    const moduleService = new ModuleService();
    const resultService = new ResultService();
    const questionService = new QuestionService();
    const studentService = new StudentService();

    const module = response["module"].toObject();

    // const totalTimeTakenByStudent = module.student_time
    //   .filter((s) => s.studentId === studentId)
    //   .map((st) => st.totalTime)[0];

    const attemptedQuestionIdsByStudent = module.questionAttempted
      .filter((q) => q.studentId === studentId)
      .map((q) => q.questionId);
    const totalAttemptedQuestions = attemptedQuestionIdsByStudent.length;

    const skippedQuestions = module.questions.filter(
      (q) => !attemptedQuestionIdsByStudent.includes(q)
    );

    let promises = [];
    attemptedQuestionIdsByStudent.forEach((id) => {
      const result = questionService.getQuestionById(id);
      promises.push(result);
    });

    const allQuestions = await Promise.all(promises);

    let totalCorrectAnswers;
    if (allQuestions.length > 0) {
      totalCorrectAnswers = allQuestions.reduce((acc, curr) => {
        const question = curr.question.toObject();

        // 1. Find the correct option ID
        const correctOption = question.options.find(
          (o: any) => o.answer === true
        );

        if (!correctOption) return acc;

        // 2. Find the student's attempt for this question
        const studentAttempt = question.attempt.find(
          (a: any) => a.studentId === studentId
        );

        if (!studentAttempt) return acc; // No attempt made by this student

        // 3. Convert studentAttempt.optionId and correctOption._id to the same type (ObjectId)
        const studentOptionId = new mongoose.Types.ObjectId(
          studentAttempt.optionId
        );
        const correctOptionId = correctOption._id;

        // 4. Compare the student's selected option ID with the correct option ID
        const isCorrect = studentOptionId.equals(correctOptionId);

        return isCorrect ? acc + 1 : acc;
      }, 0);
    }

    // const accuracy =
    //   totalAttemptedQuestions > 0
    //     ? (totalCorrectAnswers / totalAttemptedQuestions) * 100
    //     : 0;

    const result = {
      studentId: studentId,
      examId: module.examId,
      moduleId: module._id,
      chapterId: module.chapterId,

      totalQuestions: module.questions.length,
      attemptedQuestions: totalAttemptedQuestions,
      skippedQuestions: module.questions.length - totalAttemptedQuestions,
      correctAnswers: totalCorrectAnswers,
      isCompleted: module.questions.length === totalAttemptedQuestions,
      questionIds: [...attemptedQuestionIdsByStudent, ...skippedQuestions],
      //   accuracy: accuracy,
      //   totalTimeSpent: totalTimeTakenByStudent,
    };
    const resultResponse = await resultService.createResult(result);

    if (resultResponse["status"] === 200) {
      // update result in student profile
      await studentService.updateResultInStudent(
        studentId,
        resultResponse["result"]._id
      );
      // update student result in module
      await moduleService.updateResultIdInModule(id, {
        id: resultResponse["result"]._id,
        studentId,
      });
      res.status(response["status"]).json({
        status: 200,
        message: response["message"],
        data: { resultId: resultResponse["result"]._id },
      });
    } else {
      res.status(resultResponse["status"]).json(resultResponse["message"]);
    }
  } else {
    res.status(response["status"]).json(response["message"]);
  }

  // const totalTime =
  //   module.student_time.length > 0
  //     ? module.student_time.filter((c) => c.studentId === _id)[0]?.totalTime
  //     : 0;

  // const isCompleted =
  //   module.isCompleted.length > 0
  //     ? module.isCompleted.filter((c) => c.studentId === _id)[0]?.isCompleted
  //     : 0;

  // const newModule = {
  //   ...module,
  //   isCompleted: isCompleted ? isCompleted : false,
  //   student_time: totalTime ? totalTime : 0,
  // };
};

export const AddVideoInModules = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {title} = req.body

  try {
    const files = req.files as {
      video?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    };
    // ✅ Validate both files are present
    if (!files?.video?.[0] || !files?.thumbnail?.[0]) {
      res.status(400).json({
        success: false,
        message: "Both video and thumbnail files are required.",
      });
    } else {
      const videoFile = files.video[0];
      const thumbnailFile = files.thumbnail[0];

      // ✅ Generate unique names
      const videoName = `videos/${Date.now()}-${videoFile.originalname}`;
      const thumbnailName = `thumbnails/${Date.now()}-${
        thumbnailFile.originalname
      }`;

      const videoUrl = await uploadMediaFile(videoFile, videoName);
      const thumbnailUrl = await uploadMediaFile(thumbnailFile, thumbnailName);

      // Upload thumbnail to Cloudinary
      // const thumbnailResult = await cloudinary.uploader.upload(
      //   thumbnailFile.path,
      //   {
      //     folder: "modules_thumbnails",
      //     resource_type: "image",
      //   }
      // );

      // // Clean up temporary files
      // await Promise.all([
      //   // fs.unlink(videoFile.path),
      //   fs.unlink(thumbnailFile.path),
      // ]);

      const data = {
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        title: title,
      };
      //update video url in videos
      const moduleService = new ModuleService();
      const response = await moduleService.addVideoInModuleById(id, data);

      if (response["status"] === 200) {
        res.status(response["status"]).json({
          status: 200,
          data: response["module"],
          message: response["message"],
        });
      } else {
        res
          .status(response["status"])
          .json({ status: response["status"], message: response["message"] });
      }
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};
export const RestoreModules = async (req: Request, res: Response) => {
  const { id } = req.params;

  const questionService = new QuestionService();
  const moduleService = new ModuleService();
  const response = await moduleService.restoreModule(id);
  await questionService.restoreManyQuestionByModuleId([id]);

  if (response["status"] === 200) {
    res
      .status(response["status"])
      .json({ status: 200, message: response["message"] });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const DeleteVideoFromModule = async (req: Request, res: Response) => {
  const { moduleId, videoId } = req.body;
  // const moduleId = toStringParam(req.query.moduleId);
  // const videoId = toStringParam(req.query.videoId);

  const moduleService = new ModuleService();
  const response = await moduleService.removeVideoFromModule(moduleId, videoId);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: 200,
      message: response["message"],
      data: response["module"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const ReAppearModule = async (req: clientRequest, res: Response) => {
  const { id } = req.params;
  const { _id } = req.user;

  const moduleService = new ModuleService();
  const questionService = new QuestionService();
  const resultService = new ResultService();
  const studentService = new StudentService();

  //update Module true
  // moduleService.restoreModule(id)

  // pull student response from modules attempt
  const response1 = await moduleService.removeStudentResponseFromModule(
    id,
    _id
  );
  if (response1["status"] === 200) {
    // remove student response from questions
    await questionService.removeStudentResponseFromQuestion(id, _id);

    //find result and remove from student profile
    const resultResp = await resultService.getResultByStudentAndModule(_id, id);

    if (resultResp["status"] === 200) {
      await studentService.removeResultFromStudent(_id, resultResp["resultId"]);
      await resultService.removeResult(resultResp["resultId"]);
      res.status(200).json({
        status: 200,
        data: response1["module"],
      });
      // if (response2["status"] === 200) {
      //   // update isCompleted false in module for a student
      //   const response3 = await moduleService.submitModuleById(id, _id);
      //   if (response3["status"] === 200) {
      //     const module = response3["module"].toObject();

      //     const student_time = module.student_time.filter(
      //       (c) => c.studentId === _id
      //     )[0]?.totalTime;

      //     const newModule = {
      //       ...module,
      //       questionAttempted: [],
      //       isCompleted: module.isCompleted.filter(
      //         (c) => c.studentId === _id
      //       )[0].isCompleted,
      //       student_time: student_time ?? 0,
      //     };

      //     res.status(200).json({
      //       status: 200,
      //       data: newModule,
      //     });
      //   } else {
      //     res.status(response3["status"]).json(response3["message"]);
      //   }
      // } else {
      //   res.status(response2["status"]).json(response2["message"]);
      // }
    } else {
      res
        .status(resultResp["status"])
        .json({ status: resultResp["status"], message: resultResp["message"] });
    }
  } else {
    res
      .status(response1["status"])
      .json({ status: response1["status"], message: response1["message"] });
  }
};

export const RemoveModule = async (req: clientRequest, res: Response) => {
  const { id } = req.params;
  const moduleService = new ModuleService();
  const questionService = new QuestionService();

  const response = await moduleService.removeModuleById(id);

  if (response["status"] === 200) {
    await questionService.removeManyQuestionByModuleId([id]);

    res
      .status(response["status"])
      .json({ status: 200, message: response["message"] });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
