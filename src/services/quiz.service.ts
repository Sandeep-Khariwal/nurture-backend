import { randomUUID } from "crypto";
import Quiz from "../models/quiz.model";
// import { AddCloseQuizJob } from "../bullmq/producer";
import { quizPriceStaticContent } from "../staticContent/quiz.static";

export class QuizService {
  public async createQuiz(data: {
    name: string;
    examId: string;
    totalTime: number;
    quizFees: number;
    startAt: Date;
    registerStartDate: Date;
    registerEndDate: Date;
  }) {
    try {
      const quiz = new Quiz();
      quiz._id = `QUIZ-${randomUUID()}`;
      quiz.name = data.name;
      quiz.examId = data.examId;
      quiz.totalTime = data.totalTime * 60 * 1000;
      quiz.quizFees = data.quizFees;
      quiz.startAt = data.startAt;
      quiz.registerStartDate = data.registerStartDate;
      quiz.registerEndDate = data.registerEndDate;
      quiz.priceStaticContent = quizPriceStaticContent;

      quiz.isQuizLive = false;
      quiz.isRegistrationOpen = true;
      quiz.isDeleted = false;

      const savedQuiz = await quiz.save();
      const newQuiz = await savedQuiz.populate({
        path: "examId",
        select: ["_id", "name"],
      });

      const { examId, ...rest } = newQuiz.toObject() as any;

      return {
        status: 200,
        quiz: { ...rest, exam: examId },
        message: "Quiz created!!",
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async updateQuizById(
    id: string,
    data: {
      name: string;
      examId: string;
      totalTime: number;
      quizFees: number;
      startAt: Date;
      endAt: Date;
      registerStartDate: Date;
      registerEndDate: Date;
    }
  ) {
    const newData = {
      ...data,
      totalTime: data.totalTime * 60 * 1000,
    };
    try {
      const quiz = await Quiz.findByIdAndUpdate(id, newData, {
        new: true,
      }).populate([
        {
          path: "examId",
          select: ["_id", "name"],
        },
      ]);
      const { examId, ...rest } = quiz.toObject();
      return {
        status: 200,
        quiz: { ...rest, exam: examId },
        message: "Quiz updated!!",
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async registerInQuiz(data: {
    studentId: string;
    quizId: string;
    paymentId: string;
  }) {
    try {
      await Quiz.findByIdAndUpdate(data.quizId, {
        $push: {
          registeredStudent: {
            studentId: data.studentId,
            paymentId: data.paymentId,
            isEligible: true,
          },
        },
      });
      return {
        status: 200,
        message: "You have successfully registered for the Quiz!!",
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async updateStudentResponse(
    id: string,
    res: { studentId: string; questionId: string },
    pendingTime: number
  ) {
    try {
      // Step 1: Check if student_time entry exists
      const quiz = await Quiz.findOne({
        _id: id,
        questionAttempted: {
          $elemMatch: {
            studentId: res.studentId,
            questionId: res.questionId,
          },
        },
      });

      const quiz_for_st = await Quiz.findOne({
        _id: id,
        student_time: {
          $elemMatch: {
            studentId: res.studentId,
          },
        },
      });

      // Step 1: Push new question attempt if entry not present
      if (!quiz) {
        await Quiz.findByIdAndUpdate(id, {
          $push: { questionAttempted: res },
        });
      }
      if (quiz_for_st) {
        // Student already exists — update totalTime
        await Quiz.findOneAndUpdate(
          { _id: id, "student_time.studentId": res.studentId },
          {
            $set: {
              "student_time.$.totalTime": pendingTime,
            },
          }
        );
      } else {
        // Student not found — push new student_time record
        await Quiz.findByIdAndUpdate(id, {
          $push: {
            student_time: {
              studentId: res.studentId,
              totalTime: pendingTime,
            },
          },
        });
      }

      return { status: 200 };
    } catch (error) {
      console.error("Error updating student response:", error);
      return { status: 500, message: error.message };
    }
  }

  public async setQuizLive(quizId: string) {
    try {
      const quiz = await Quiz.findByIdAndUpdate(quizId, {
        $set: { isQuizLive: true },
      });

      if (!quiz) {
        return {
          status: 404,
          message: "Quiz not found!!",
        };
      }

      // AddCloseQuizJob({ totalTime: quiz.totalTime, quizId: quizId });

      return { status: 200, message: "Quiz is now live!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async setQuizClose(quizId: string) {
    try {
      const quiz = await Quiz.findByIdAndUpdate(quizId, {
        $set: { isQuizLive: false },
      });

      if (!quiz) {
        return {
          status: 404,
          message: "Quiz not found!!",
        };
      }

      return { status: 200, message: "Quiz is now closed!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async setRegistrationOpen(quizId: string) {
    try {
      const quiz = await Quiz.findByIdAndUpdate(quizId, {
        $set: { isRegistrationOpen: true },
      });

      if (!quiz) {
        return {
          status: 404,
          message: "Quiz not found!!",
        };
      }

      return { status: 200, message: "Registration is now open!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async setRegistrationClose(quizId: string) {
    try {
      const quiz = await Quiz.findByIdAndUpdate(quizId, {
        $set: { isRegistrationOpen: false },
      });

      if (!quiz) {
        return {
          status: 404,
          message: "Quiz not found!!",
        };
      }

      return { status: 200, message: "Registration is now closed!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getQuiz(exam: string, studentId: string) {
    try {
      // find quiz for registration
      const today = new Date();
      const startOfDay = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          0,
          0,
          0
        )
      );
      const endOfDay = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );

      const quizeForRegistration = await Quiz.findOne({
        examId: exam,
        registerStartDate: { $lte: endOfDay },
        registerEndDate: { $gte: startOfDay },
        isDeleted: false,
      }).populate([
        {
          path: "examId",
          select: ["_id", "name"],
        },
        {
          path: "questions",
          match: { isDeleted: false },
          select: ["_id", "options"],
        },
        {
          path: "questionAttempted.questionId", // Populate nested questionId
          select: ["_id", "attempt"],
        },
      ]);
      if (quizeForRegistration) {
        await Quiz.findByIdAndUpdate(quizeForRegistration._id, {
          $set: {
            isQuizLive: false,
            isRegistrationOpen: true,
          },
        });
        const { examId, ...newQuizeForRegistration } =
          quizeForRegistration.toObject() as any;
        const isIamRegistered =
          quizeForRegistration.registeredStudent.filter(
            (std) => std.studentId === studentId
          )[0]?.isEligible ?? false;
        const isCompleted =
          quizeForRegistration.isCompleted.filter(
            (std) => std.studentId === studentId
          )[0]?.isCompleted ?? false;
        const resultId =
          quizeForRegistration.resultId.filter(
            (std) => std.studentId === studentId
          )[0]?.id ?? "";
        const student_time =
          quizeForRegistration.student_time.filter(
            (std) => std.studentId === studentId
          )[0]?.totalTime ?? quizeForRegistration.totalTime;
        const questions = quizeForRegistration.questions.map((q: any) => {
          const correctOption = q.options.find((op) => op.answer === true);
          return {
            _id: q._id,
            optionId: correctOption._id,
          };
        });
        const attemptedQuestion = quizeForRegistration.questionAttempted
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

        return {
          status: 200,
          quiz: {
            ...newQuizeForRegistration,
            isRegistrationOpen: true,
            registeredStudent: isIamRegistered,
            examName: examId.name,
            isCompleted: isCompleted,
            questions: questions,
            isQuizLive: false,
            questionAttempted: attemptedQuestion,
            resultId: resultId,
            student_time: student_time,
          },
        };
      }

      // code for getting live quiz
      const now: Date = new Date();

      // Step 1: Find the quiz by examId and eligible student
      let quiz = await Quiz.findOne({
        examId: exam,
        isDeleted: false,
        registeredStudent: {
          $elemMatch: {
            studentId: studentId,
            isEligible: true,
          },
        },
      }).populate([
        {
          path: "examId",
          select: ["_id", "name"],
        },
        {
          path: "questions",
          match: { isDeleted: false },
          select: ["_id", "options"],
        },
        {
          path: "questionAttempted.questionId", // Populate nested questionId
          select: ["_id", "attempt"],
        },
      ]);

      // Step 2: Return 404 if not found
      if (!quiz) {
        return {
          status: 404,
          message: "Quiz not found!",
        };
      }

      const date = new Date();
      const fiveAndHalfHoursInMs = 5.5 * 60 * 60 * 1000;
      const newDate = new Date(date.getTime() + fiveAndHalfHoursInMs);

      const startAt = new Date(quiz.startAt); // Stored in DB as UTC
      const endAt = new Date(startAt.getTime() + quiz.totalTime); // quiz.totalTime is in milliseconds

      // ✅ Compare Date objects directly (UTC-safe)
      const isLiveNow = newDate >= startAt && newDate <= endAt;

      if (!isLiveNow) {
        return {
          status: 404,
          message: "Quiz is not live right now.",
        };
      }

      // Step 5: If quiz is now live, update DB flags once
      if (!quiz.isQuizLive) {
        await Quiz.findByIdAndUpdate(quiz._id, {
          $set: {
            isQuizLive: true,
            isRegistrationOpen: false,
          },
        });

        // Step 6: Schedule the job to close the quiz later
        // AddCloseQuizJob({
        //   totalTime: quiz.totalTime,
        //   quizId: quiz._id,
        // });

        // Optional: refetch updated quiz if needed
        quiz = await Quiz.findById(quiz._id).populate([
          {
            path: "examId",
            select: ["_id", "name"],
          },
          {
            path: "questions",
            match: { isDeleted: false },
            select: ["_id", "options"],
          },
          {
            path: "questionAttempted.questionId", // Populate nested questionId
            select: ["_id", "attempt"],
          },
        ]);
      }

      const { examId, ...rest } = quiz.toObject() as any;
      const isIamRegistered =
        quiz.registeredStudent.filter((std) => std.studentId === studentId)[0]
          ?.isEligible ?? false;

      const isCompleted =
        quiz.isCompleted.filter((std) => std.studentId === studentId)[0]
          ?.isCompleted ?? false;
      const resultId =
        quiz.resultId.filter((std) => std.studentId === studentId)[0]?.id ?? "";
      const student_time =
        quiz.student_time.filter((std) => std.studentId === studentId)[0]
          ?.totalTime ?? quiz.totalTime;

      const questions = quiz.questions.map((q: any) => {
        const correctOption = q.options.find((op) => op.answer === true);
        return {
          _id: q._id,
          optionId: correctOption._id,
        };
      });

      const attemptedQuestion = quiz.questionAttempted
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

      return {
        status: 200,
        quiz: {
          ...rest,
          registeredStudent: isIamRegistered,
          isCompleted: isCompleted,
          questions: questions,
          resultId: resultId,
          examName: examId.name,
          student_time: student_time,
          questionAttempted: attemptedQuestion,
        },
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  public async addNewQuestionInQuiz(id: string, questionId: string) {
    try {
      await Quiz.findByIdAndUpdate(id, {
        $addToSet: { questions: questionId },
      });
      return { status: 200 };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async submitQuizById(quizId: string, studentId: string) {
    try {
      // If student entry does not exist, add with isCompleted: true
      const updatedquiz = await Quiz.findByIdAndUpdate(
        quizId,
        {
          $push: {
            isCompleted: {
              studentId: studentId,
              isCompleted: true,
            },
          },
        },
        { new: true }
      );

      return {
        status: 200,
        message: "Quiz submitted!!",
        quiz: updatedquiz,
      };
    } catch (error) {
      console.error("Error in submitquizById:", error);
      return { status: 500, message: error.message };
    }
  }

  public async updateResultIdInQuiz(
    id: string,
    data: { id: string; studentId: string }
  ) {
    try {
      const quiz = await Quiz.findByIdAndUpdate(
        id,
        {
          $push: { resultId: data },
        },
        { new: true }
      );
      if (!quiz) {
        return { status: 404, message: "quiz not found!!" };
      }
      return { status: 200, quiz, message: "Result updated!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async addWinnerPrizeInQuizById(
    id: string,
    data: {
      winnerPrices: {
        firstPrize: string;
        secondPrize: string;
        thirdPrize: string;
      };
      priceStaticContent: string;
    }
  ) {
    try {
      const quiz = await Quiz.findByIdAndUpdate(
        id,
        {
          $set: {
            "winnerPrices.firstPrize": data.winnerPrices.firstPrize,
            "winnerPrices.secondPrize": data.winnerPrices.secondPrize,
            "winnerPrices.thirdPrize": data.winnerPrices.thirdPrize,
          },
        },
        { new: true }
      );

      if (!quiz) {
        return { status: 404, message: "Quiz not found!!" };
      }

      return { status: 200, quiz, message: "Quiz Winner Prize updated!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async removeQuizById(id: string) {
    try {
      const quiz = await Quiz.findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: true },
        },
        { new: true }
      );
      if (!quiz) {
        return { status: 404, message: "quiz not found!!" };
      }
      return { status: 200, quiz, message: "quiz removed!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getAllQuizByExamId(examId?: string) {
    try {
      let quizes;
      if (examId) {
        quizes = await Quiz.find({
          examId,
          isDeleted: false,
        })
          .populate([
            {
              path: "examId",
              select: ["_id", "name"],
            },
          ])
          .sort({ createdAt: -1 });
      } else {
        quizes = await Quiz.find({
          isDeleted: false,
        })
          .populate([
            {
              path: "examId",
              select: ["_id", "name"],
            },
          ])
          .sort({ createdAt: -1 });
      }

      if (quizes && quizes.length === 0) {
        return { status: 200, quizes, message: "Quizes not found!!" };
      }

      quizes = quizes.map((quiz: any) => {
        const newQuiz = quiz.toObject();
        const { examId, ...rest } = newQuiz;

        return {
          ...rest,
          exam: examId,
          registeredStudent: newQuiz.registeredStudent.length,
        };
      });

      return { status: 200, quizes };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async getQuizForRegistration(examId: string) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setUTCHours(23, 59, 59, 999));

      const quiz = await Quiz.findOne({
        examId,
        registerStartDate: { $lte: startOfDay },
        registerEndDate: { $gte: endOfDay },
        isRegistrationOpen: true,
        isDeleted: false,
      });

      if (!quiz) {
        return { status: 404, message: "quiz not found!!" };
      }

      return { status: 200, quiz };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async getQuizById(quizId: string) {
    try {
      const quiz = await Quiz.findById(quizId);

      if (!quiz) {
        return { status: 404, message: "Quize not found!!" };
      }

      return { status: 200, quiz };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async uploadPrizeImages(quizId: string, imageUrl: string) {

    try {
      const quiz = await Quiz.findByIdAndUpdate(
        quizId,
        {
          $push: {
            "winnerPrices.images": {
              $each: [imageUrl],
              $position: 0,
            },
          },
          push: { "winnerPrices.images": imageUrl },
        },
        { new: true }
      );

      if (!quiz) {
        return { status: 404, message: "Quiz not found!!" };
      }

      return { status: 200, images: quiz.winnerPrices.images };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
  public async removeImageUrlFromQuiz(id: string, imageUrl: string) {
    try {
      const quiz = await Quiz.findByIdAndUpdate(
        id,
        {
          $pull: { "winnerPrices.images": imageUrl },
        },
        { new: true }
      );

      if (!quiz) {
        return { status: 404, message: "Quiz not found!!" };
      }

      return {
        status: 200,
        quiz: quiz,
        message: "Image Removed successfully!!",
      };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
}
