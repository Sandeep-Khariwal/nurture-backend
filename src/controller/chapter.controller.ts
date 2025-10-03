import { clientRequest, toStringParam } from "./../middleware/jwtToken";
import { ExamService } from "../services/exam.service";
import { ChapterService } from "../services/chapter.services";
import { Request, Response } from "express";
import { log } from "winston";
import { ModuleService } from "../services/module.service";
import { QuestionService } from "../services/question.service";

export const CreateChapter = async (req: Request, res: Response) => {
  const { name, examId, chapterId } = req.body;

  const chapterService = new ChapterService();
  const examService = new ExamService();

  let response;
  if (chapterId) {
    response = await chapterService.updateChapterById(name, chapterId, examId);
  } else {
    response = await chapterService.createChapter({ name, examId });
  }

  if (response["status"] === 200) {
    // add chapter in exam
    if (!chapterId) {
      await examService.addNewChapter(examId, response["chapter"]._id);
    }

    res.status(200).json({
      status: 200,
      data: response["chapter"],
      message: response["message"],
    });
  } else {
    res.status(response["status"]).json(response["message"]);
  }
};
export const GetAllChapter = async (req: Request, res: Response) => {
  const examId = toStringParam(req.query.examId);

  const chapterService = new ChapterService();

  let response;
  if (examId) {
    response = await chapterService.getAllChaptersByExamId(examId);
  } else {
    response = await chapterService.getAllChapters();
  }

  if (response["status"] === 200) {
    const chapters = response["chapters"].map((c) => {
      const chapter = c;
      return {
        ...chapter,
        modules: chapter.modules.length,
      };
    });

    res.status(200).json({
      status: 200,
      data: chapters,
    });
  } else {
    res
      .status(response["status"])
      .json({
        status: response["status"],
        data: { chapters: response["chapters"] },
        message: response["message"],
      });
  }
};

export const RemoveChapter = async (req: Request, res: Response) => {
  const { id } = req.params;

  const chapterService = new ChapterService();
  const moduleService = new ModuleService();
  const questionService = new QuestionService();

  const response = await chapterService.removeChapterById(id);

  if (response["status"] === 200) {
    // remove all modules present in chapter
    await moduleService.removeManyModulesByChapterIds([id]);

    // remove all all questions present in all modules
    const moduleIds = response["chapter"].modules;
    await questionService.removeManyQuestionByModuleId(moduleIds);
    res
      .status(response["status"])
      .json({ status: 200, message: response["message"] });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
