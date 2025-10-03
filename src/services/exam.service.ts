import { randomUUID } from "crypto";
import examsModel from "../models/exams.model";
import { IsStudent } from "../HelperFunction";

export class ExamService {
  public async createExam(name: string) {
    try {
      const exam = new examsModel();

      exam._id = `EXAM-${randomUUID()}`;
      exam.name = name;
      const savedExam = await exam.save();
      return { status: 200, exam: savedExam, message: "Exam created!!" };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }

  public async updateExamById(id: string, name: string) {
    try {
      const exam = await examsModel.findByIdAndUpdate(
        id,
        { name },
        { new: true }
      );
      return { status: 200, exam, message: "Exam updated!!" };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }
  public async getExamIdByName(examName: string) {
    try {
      const exam = await examsModel.findOne({
        name: examName,
      });
      if(!exam){
        return {status:404,message:"Exam not found!!"}
      }
      return { status: 200, exam, message: "Exam updated!!" };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }
  public async updateDDQById(id: string, questionId: string) {
    try {
      await examsModel.findByIdAndUpdate(id, {
        $push: { dailyDoses: questionId },
      });
      return { status: 200, message: "Exam updated!!" };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }
  public async findAllExams() {
    try {
      const exams = await examsModel.find({ isDeleted: false });
      return {
        status: 200,
        exams: exams.map((e) => {
          return { _id: e._id, name: e.name };
        }),
      };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async findNameById(id: string) {
    try {
      const exam = await examsModel.findById(id, { isDeleted: false });
      return exam;
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async addNewChapter(id: string, chapterId: string) {
    try {
      await examsModel.findByIdAndUpdate(id, {
        $addToSet: { chapters: chapterId },
      });
      return { status: 200 };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async removeExamById(id: string) {
    try {
      const exam = await examsModel.findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: true },
        },
        { new: true }
      );
      if (!exam) {
        return { status: 404, message: "Exam not found!!" };
      }
      return { status: 200, exam: exam, message: "Exam removed!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async addMiniTestModules(id: string, moduleId: string) {
    try {
      const exam = await examsModel.findByIdAndUpdate(id, {
        $addToSet: { mini_test_modules: moduleId },
      });

      return { status: 200, exam };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async addMockDrillsModules(id: string, moduleId: string) {
    try {
      const exam = await examsModel.findByIdAndUpdate(id, {
        $addToSet: { mock_drills_modules: moduleId },
      });

      return { status: 200, exam };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async getAllMiniTestModulesFromExam(id: string, studentId: string) {
    const isStudent = IsStudent(studentId);
    try {
      let exam;
      if (isStudent) {
        exam = await examsModel.findById(id).populate([
          {
            path: "mini_test_modules",
            match: { isDeleted: false },
            populate: [
              {
                path: "examId",
                match: { isDeleted: false },
                select: ["_id", "name"],
              },
              {
                path: "questions",
                match: { isDeleted: false },
                select: ["_id", "options", "isDeleted"],
              },
              {
                path: "questionAttempted.questionId", // Populate nested questionId
                match: { isDeleted: false },
                select: ["_id", "attempt", "isDeleted"],
              },
            ],
          },
        ]);
      } else {
        exam = await examsModel
          .findById(id)
          .select("mini_test_modules")
          .populate([
            {
              path: "mini_test_modules",
              match: { isDeleted: false },
              select: ["_id", "name", "examId", "isPro", "totalTime"],
              populate: [
                {
                  path: "examId",
                  match: { isDeleted: false },
                  select: ["_id", "name"],
                },
              ],
            },
          ]);
      }

      const modules: any = exam["mini_test_modules"].filter(
        (m: any) => !m.isDeleted
      );

      let result;
      if (isStudent) {
        if (modules.length === 0) {
          return { status: 200, modules, message: "Modules not found!!" };
        }
        result = modules.map((module) => {
          const plainModule = module.toObject(); // This avoids the _doc error

          const attemptedQuestion = plainModule.questionAttempted
            .map((qAtt: any) => {
              const student = qAtt.questionId.attempt.find(
                (std: any) => std.studentId === qAtt.studentId
              );

              if (student && student.studentId === studentId) {
                return {
                  _id: qAtt.questionId._id,
                  studentId: student.studentId,
                  optionId: student.optionId,
                };
              }
            })
            .filter((s) => s);
          const isCompleted =
            module.isCompleted.length > 0
              ? module.isCompleted.filter((c) => c.studentId === studentId)[0]
                  ?.isCompleted
              : 0;

          const { examId, ...plainModule1 } = plainModule;
          const resultId =
            plainModule1.resultId.filter((st) => st.studentId === studentId)[0]
              ?.id ?? "";
          return {
            ...plainModule1,
            exam: examId,
            questions: plainModule1.questions.map((q: any) => {
              const correctOption = q.options.find(
                (opt: any) => opt.answer === true
              );
              return {
                _id: q._id,
                optionId: correctOption ? correctOption._id : null,
              };
            }),
            isCompleted: isCompleted ? isCompleted : false,

            questionAttempted:
              attemptedQuestion.length > 0 ? attemptedQuestion : [],
            student_time:
              plainModule1.student_time.filter(
                (st) => st.studentId === studentId
              )[0]?.totalTime ?? 0,
            resultId: resultId,
          };
        });
      } else {
        if (modules.length === 0) {
          return { status: 200, modules, message: "Modules not found!!" };
        }
        result = modules.map((m: any) => {
          const { examId, ...rest } = m.toObject();

          return {
            ...rest,
            exam: examId,
          };
        });
      }

      return { status: 200, modules: result };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async getAllMockDrillModulesFromExam(id: string, studentId: string) {
    try {
      const isStudent = IsStudent(studentId);
      let exam;
      if (isStudent) {
        exam = await examsModel.findById(id).populate([
          {
            path: "mock_drills_modules",
            match: { isDeleted: false },
            populate: [
              {
                path: "examId",
                match: { isDeleted: false },
                select: ["_id", "name"],
              },
              {
                path: "questions",
                match: { isDeleted: false },
                select: ["_id", "options", "isDeleted"],
              },
              {
                path: "questionAttempted.questionId", // Populate nested questionId
                match: { isDeleted: false },
                select: ["_id", "attempt", "isDeleted"],
              },
            ],
          },
        ]);
      } else {
        exam = await examsModel
          .findById(id)
          .select("mock_drills_modules")
          .populate([
            {
              path: "mock_drills_modules",
              match: { isDeleted: false },
              select: ["_id", "name", "examId", "isPro", "totalTime"],
              populate: [
                {
                  path: "examId",
                  match: { isDeleted: false },
                  select: ["_id", "name"],
                },
              ],
            },
          ]);
      }

      const modules: any = exam["mock_drills_modules"].filter(
        (m: any) => !m.isDeleted
      );

      let result;

      if (isStudent) {
        if (modules.length === 0) {
          return { status: 200, modules, message: "Modules not found!!" };
        }
        result = modules.map((module) => {
          const plainModule = module.toObject(); // This avoids the _doc error

          const attemptedQuestion = plainModule.questionAttempted
            .map((qAtt: any) => {
              const student = qAtt.questionId.attempt.find(
                (std: any) => std.studentId === qAtt.studentId
              );

              if (student.studentId === studentId) {
                return {
                  _id: qAtt.questionId._id,
                  studentId: student.studentId,
                  optionId: student.optionId,
                };
              }
            })
            .filter((s) => s);
          const isCompleted =
            module.isCompleted.length > 0
              ? module.isCompleted.filter((c) => c.studentId === studentId)[0]
                  ?.isCompleted
              : 0;

          const { examId, ...plainModule1 } = plainModule;
          const resultId =
            plainModule1.resultId.filter((st) => st.studentId === studentId)[0]
              ?.id ?? "";
          return {
            ...plainModule1,
            exam: examId,
            questions: plainModule1.questions.map((q: any) => {
              const correctOption = q.options.find(
                (opt: any) => opt.answer === true
              );
              return {
                _id: q._id,
                optionId: correctOption ? correctOption._id : null,
              };
            }),
            isCompleted: isCompleted ? isCompleted : false,

            questionAttempted:
              attemptedQuestion.length > 0 ? attemptedQuestion : [],
            student_time:
              plainModule1.student_time.filter(
                (st) => st.studentId === studentId
              )[0]?.totalTime ?? 0,
            resultId: resultId,
          };
        });
      } else {
        if (modules.length === 0) {
          return { status: 200, modules, message: "Modules not found!!" };
        }
        result = modules.map((m: any) => {
          const { examId, ...rest } = m.toObject();

          return {
            ...rest,
            exam: examId,
          };
        });
      }

      return { status: 200, modules: result };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }

  public async addSubscriptionInExam(id: string, subscriptionId: string) {
    try {
      await examsModel.findByIdAndUpdate(id, {
        $addToSet: { subscriptions: subscriptionId },
      });

      return { status: 200, message: "Subscription added in exam!!" };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async getExamById(id: string) {
    try {
      const exam = await examsModel.findById(id);

      if (!exam) {
        return { status: 404, message: "Exam not found!!" };
      }

      return { status: 200, exam: exam };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
}
