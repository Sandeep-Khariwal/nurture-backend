import { IsStudent } from "../HelperFunction";
import { ModuleType } from "../enums/test.enum";
import examsModel from "../models/exams.model";
import Module from "../models/modules.model";
import { randomUUID } from "crypto";

export class ModuleService {
  public async createModule(data: {
    name: string;
    examId: string;
    chapterId: string;
    isPro: boolean;
    totalTime: number;
  }) {
    try {
      const module = new Module();
      module._id = `MDLE-${randomUUID()}`;
      module.name = data.name;
      module.examId = data.examId;
      module.chapterId = data.chapterId;
      module.isPro = data.isPro;
      module.totalTime = data.totalTime * 60 * 1000;
      module.isDeleted = false;

      const savedModule = await module.save();
      return { status: 200, module: savedModule, message: "module created!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async updateModuleById(
    id: string,
    data: {
      name: string;
      examId: string;
      chapterId: string;
      isPro: boolean;
      totalTime: number;
    }
  ) {
    const newData = {
      ...data,
      totalTime: data.totalTime * 60 * 1000,
    };
    try {
      const module = await Module.findByIdAndUpdate(id, newData, { new: true });
      return { status: 200, module, message: "module updated!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getModuleById(id: String) {
    try {
      const module = await Module.findById(id, { isDeleted: false });

      if (!module) {
        return { status: 404, message: "Module not found!!" };
      }

      return { status: 200, module };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async getAllModulesByModuleType(id: string, moduleType: String) {
    const isStudent = IsStudent(id);
    try {
      let exams;
      if (isStudent) {
        exams = await examsModel.find({}).populate([
          {
            path: "mini_test_modules",
            match: { isDeleted: false },
            populate: {
              path: "examId",
              match: { isDeleted: false },
              select: ["_id", "name"],
            },
          },

          {
            path: "mock_drills_modules",
            match: { isDeleted: false },
            populate: {
              path: "examId",
              match: { isDeleted: false },
              select: ["_id", "name"],
            },
          },
        ]);
      } else {
        exams = await examsModel.find({}).populate([
          {
            path: "mini_test_modules",
            match: { isDeleted: false },
            select: ["_id", "name", "examId", "isPro", "totalTime"],
            populate: {
              path: "examId",
              match: { isDeleted: false },
              select: ["_id", "name"],
            },
          },
          {
            path: "mock_drills_modules",
            match: { isDeleted: false },
            select: ["_id", "name", "examId", "isPro", "totalTime"],
            populate: {
              path: "examId",
              match: { isDeleted: false },
              select: ["_id", "name"],
            },
          },
        ]);
      }

      if (!exams) {
        return { status: 404, message: "Exam not found" };
      }

      const modules = exams.map((e: any) => {
        const exm = e.toObject();

        if (ModuleType.MINI_TEST === moduleType) {
          return exm.mini_test_modules;
        }
        if (ModuleType.MOCK_DRILLS === moduleType) {
          return exm.mock_drills_modules;
        }
      });
      if (!modules || modules.length === 0) {
        return { status: 200, modules, message: "Modules not found!!" };
      }

      return {
        status: 200,
        modules: modules.flat(Infinity),
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getAllModulesByChapterId(id: string, studentId: string) {
    try {
      const isStudent = IsStudent(studentId);

      let modules;
      if (isStudent) {
        modules = await Module.find({
          chapterId: id,
          isDeleted: false,
        }).populate([
          {
            path: "examId",
            match: { isDeleted: false },
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
      } else {
        modules = await Module.find({
          chapterId: id,
          isDeleted: false,
        })
          .select(["_id", "name", "examId", "isPro", "totalTime"])
          .populate([
            {
              path: "examId",
              match: { isDeleted: false },
              select: ["_id", "name"],
            },
          ]);
      }

      if (isStudent) {
        if (modules.length === 0) {
          return { status: 200, modules, message: "Modules not found!!" };
        }

        modules = modules.map((module) => {
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
        modules = modules.map((m: any) => {
          const { examId, ...rest } = m.toObject();

          return {
            ...rest,
            exam: examId,
          };
        });
      }
      return { status: 200, modules: modules };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async getAllModulesByExamId(id: string, studentId: string) {
    try {
      const isStudent = IsStudent(studentId);
      let modules;
      if (isStudent) {
        modules = await Module.find({
          examId: id,
          isDeleted: false,
        }).populate([
          {
            path: "examId",
            match: { isDeleted: false },
            select: ["_id", "name"],
          },
          {
            path: "questions",
            match: { isDeleted: false },
            select: ["_id", "options"],
          },
          {
            path: "questionAttempted.questionId", // Populate nested questionId
            match: { isDeleted: false },
            select: ["_id", "attempt"],
          },
        ]);
      } else {
        modules = await Module.findById({
          examId: id,
          isDeleted: false,
        })
          .select(["_id", "name", "examId", "isPro", "totalTime"])
          .populate([
            {
              path: "examId",
              match: { isDeleted: false },
              select: ["_id", "name"],
            },
          ]);
      }

      if (isStudent) {
        if (modules.length === 0) {
          return { status: 200, modules, message: "Modules not found!!" };
        }
        modules = modules.map((module) => {
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
        modules = modules.map((m: any) => {
          const { examId, ...rest } = m.toObject();

          return {
            ...rest,
            exam: examId,
          };
        });
      }

      return { status: 200, modules: modules };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async getAllModules(studentId: string) {
    try {
      const isStudent = IsStudent(studentId);
      let modules;
      if (isStudent) {
        modules = await Module.find({}).populate([
          {
            path: "examId",
            match: { isDeleted: false },
            select: ["_id", "name"],
          },
          {
            path: "questions",
            match: { isDeleted: false },
            select: ["_id", "options"],
          },
          {
            path: "questionAttempted.questionId", // Populate nested questionId
            match: { isDeleted: false },
            select: ["_id", "attempt"],
          },
        ]);
      } else {
        modules = await Module.find({})
          .select(["_id", "name", "examId", "isPro", "totalTime"])
          .populate([
            {
              path: "examId",
              match: { isDeleted: false },
              select: ["_id", "name"],
            },
          ]);
      }

      if (isStudent) {
        if (modules.length === 0) {
          return { status: 200, modules, message: "Modules not found!!" };
        }
        modules = modules
          .filter((m) => !m?.isDeleted)
          .map((module) => {
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
            const resultId = plainModule1.resultId.filter(
              (st) => st.studentId === studentId
            )[0]?.id;
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
        modules = modules.map((m: any) => {
          const { examId, ...rest } = m.toObject();

          return {
            ...rest,
            exam: examId,
          };
        });
      }

      return { status: 200, modules: modules };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async addNewQuestionInModal(id: string, questionId: string) {
    try {
      await Module.findByIdAndUpdate(id, {
        $addToSet: { questions: questionId },
      });
      return { status: 200 };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async restoreModule(id: string) {
    try {
      await Module.findByIdAndUpdate(id, {
        $set: { isDeleted: false },
      });
      return { status: 200, message: "Module restored!!" };
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
      const module = await Module.findOne({
        _id: id,
        questionAttempted: {
          $elemMatch: {
            studentId: res.studentId,
            questionId: res.questionId,
          },
        },
      });

      const module_for_st = await Module.findOne({
        _id: id,
        student_time: {
          $elemMatch: {
            studentId: res.studentId,
          },
        },
      });

      // Step 1: Push new question attempt if entry not present
      if (!module) {
        await Module.findByIdAndUpdate(id, {
          $push: { questionAttempted: res },
        });
      }
      if (module_for_st) {
        // Student already exists — update totalTime
        await Module.findOneAndUpdate(
          { _id: id, "student_time.studentId": res.studentId },
          {
            $set: {
              "student_time.$.totalTime": pendingTime,
            },
          }
        );
      } else {
        // Student not found — push new student_time record
        await Module.findByIdAndUpdate(id, {
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

  public async submitModuleById(moduleId: string, studentId: string) {
    try {
      // const module = await Module.findOne({
      //   _id: moduleId,
      //   "isCompleted.studentId": studentId,
      // });

      // if (module) {
      //   // Find the current isCompleted value
      //   const studentEntry = module.isCompleted.find(
      //     (entry) => entry.studentId === studentId
      //   );

      //   const newStatus = !studentEntry?.isCompleted; // toggle the value

      //   // Update the specific student entry's isCompleted value
      //   const updatedModule = await Module.findOneAndUpdate(
      //     {
      //       _id: moduleId,
      //       "isCompleted.studentId": studentId,
      //     },
      //     {
      //       $set: {
      //         "isCompleted.$.isCompleted": newStatus,
      //       },
      //     },
      //     { new: true }
      //   );

      //   return {
      //     status: 200,
      //     message: "Module submit updated!!",
      //     module: updatedModule,
      //   };
      // }

      // If student entry does not exist, add with isCompleted: true
      const updatedModule = await Module.findByIdAndUpdate(
        moduleId,
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
        message: "Submitted done!!",
        module: updatedModule,
      };
    } catch (error) {
      console.error("Error in submitModuleById:", error);
      return { status: 500, message: error.message };
    }
  }

  public async removeStudentResponseFromModule(id: string, studentId: string) {
    try {
      const module = await Module.findOne({
        _id: id,
        "questionAttempted.studentId": studentId,
      });
      if (!module) {
        return { status: 200, message: "Module already re-appeared!!" };
      }

      const updatedDoc = await Module.findOneAndUpdate(
        { _id: id },
        {
          $pull: {
            questionAttempted: { studentId: studentId },
            student_time: { studentId: studentId },
            isCompleted: { studentId: studentId },
            resultId: { studentId: studentId },
          },
        },
        { new: true }
      );
      const newModule = updatedDoc.toObject() as any;

      newModule.isCompleted = false;
      newModule.student_time = 0;
      newModule.resultId = "";
      newModule.questionAttempted = [];
      // Step 2: Check if student_time entry exists

      // if (module && updatedDoc) {
      //   // Student already exists — update totalTime
      //   await Module.findOneAndUpdate(
      //     { _id: id, "student_time.studentId": studentId },
      //     {
      //       $set: {
      //         "student_time.$.totalTime": updatedDoc.totalTime,
      //       },
      //     }
      //   );
      // }

      return { status: 200, module: newModule, message: "Student removed!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async removeModuleById(id: string) {
    try {
      const module = await Module.findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: true },
        },
        { new: true }
      );
      if (!module) {
        return { status: 404, message: "Module not found!!" };
      }
      return { status: 200, module, message: "Module removed!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async updateResultIdInModule(
    id: string,
    data: { id: string; studentId: string }
  ) {
    try {
      const module = await Module.findByIdAndUpdate(
        id,
        {
          $push: { resultId: data },
        },
        { new: true }
      );
      if (!module) {
        return { status: 404, message: "Module not found!!" };
      }
      return { status: 200, module, message: "Module removed!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async removeManyModulesByChapterIds(chapterIds: string[]) {
    try {
      // Step 1: Find all module _ids associated with the chapterIds
      const modules = await Module.find({
        chapterId: { $in: chapterIds },
        isDeleted: false,
      }).lean();

      const moduleIds = modules.map((mod) => mod._id);

      // Step 2: Update those modules to set isDeleted: true
      await Module.updateMany(
        {
          chapterId: { $in: chapterIds },
        },
        { $set: { isDeleted: true } }
      );

      return {
        status: 200,
        message: "Modules deleted!!",
        moduleIds,
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || "Internal Server Error",
      };
    }
  }

  public async getCompletedModulesByExamId(id: string, studentId: string) {
    try {
      const modules = await Module.find({
        examId: id,
        isDeleted: false,
        isCompleted: {
          $elemMatch: {
            studentId: studentId,
            isCompleted: true,
          },
        },
      })
        .select([
          "_id",
          "name",
          "questions",
          "isDeleted",
          "isPro",
          "resultId",
          "isCompleted",
          "student_time",
          "chapterId",
        ])
        .populate([
          {
            path: "chapterId",
            select: ["_id", "name"],
          },
          {
            path: "questions",
            select: ["_id", "question", "options", "attempt"],
          },
        ]);

      if (!modules || modules.length === 0) {
        return {
          status: 200,
          modules: [],
          message: "List is empty",
        };
      }

      // Process each question to find correct and selected answer

      const processedQModules = modules.map((modules: any) => {
        const module = modules.toObject();
        const processedQuestions = module.questions.map((q: any) => {
          const correctOption = q.options.find(
            (opt: any) => opt.answer === true
          );

          // Assuming attempt is an array like: [{ optionId: '...' }]
          const attempted = q.attempt?.find(
            (att) => att.studentId === studentId
          );

          const selectedOption = q.options.find(
            (opt: any) => String(opt._id) === String(attempted?.optionId)
          );
          if (selectedOption) {
            const isWrongAnswer =
              correctOption.answer !== selectedOption.answer;

            if (isWrongAnswer && attempted) {
              return {
                _id: q._id,
                question: q.question,
                options: [correctOption, selectedOption],
              };
            }
          }
        });

        // const myAttempted = module.questionAttempted.filter(
        //   (att) => att.studentId === studentId
        // );
        const isCompleted = module.isCompleted.filter(
          (att) => att.studentId === studentId
        )[0].isCompleted;
        const myTime = module.student_time.filter(
          (att) => att.studentId === studentId
        )[0].totalTime;

        const resultId = module.resultId
          .filter((att) => att.studentId === studentId)
          .map((res) => res?.id)[0];
        const { chapterId, ...rest } = module;
        return {
          ...rest,
          questions: processedQuestions.filter((q) => q).map((q) => q._id),
          // questionAttempted: myAttempted,
          student_time: myTime,
          isCompleted,
          resultId,
          chapterName: chapterId?.name ? chapterId.name : "",
        };
      });

      return {
        status: 200,
        modules: processedQModules,
        message: "List found!!",
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || "Internal Server Error",
      };
    }
  }
  public async getAllWrongQuestionsByModuleId(id: string, studentId: string) {
    try {
      const modules = await Module.findById(id).populate([
        {
          path: "questions",
          select: ["_id", "question", "options", "attempt", "explaination"],
        },
      ]);
      if (modules && modules.isDeleted) {
        return { status: 404, message: "Module not found!!" };
      }

      // Process each question to find correct and selected answer
      const module = modules.toObject();
      const processedQuestions = module.questions.map((q: any) => {
        const correctOption = q.options.find((opt: any) => opt.answer === true);

        // Assuming attempt is an array like: [{ optionId: '...' }]
        const attempted = q.attempt?.find((att) => att.studentId === studentId);

        const selectedOption = q.options.find(
          (opt: any) => String(opt._id) === String(attempted?.optionId)
        );
        if (selectedOption) {
          const isWrongAnswer = correctOption.answer !== selectedOption.answer;

          if (isWrongAnswer && attempted) {
            const options = q.options.map((opt) => {
              if (String(opt._id) === String(attempted?.optionId)) {
                return {
                  ...opt,
                  attempt: true,
                };
              } else {
                return {
                  ...opt,
                  attempt: false,
                };
              }
            });
            return {
              _id: q._id,
              question: q.question,
              options: options,
              explaination: q.explaination,
            };
          }
        }
      });

      const isCompleted = module.isCompleted.filter(
        (att) => att.studentId === studentId
      )[0].isCompleted;
      const myTime = module.student_time.filter(
        (att) => att.studentId === studentId
      )[0].totalTime;
      const resultId = module.resultId.filter(
        (att) => att.studentId === studentId
      )[0].id;

      const newModule = {
        ...module,
        questions: processedQuestions.filter((q) => q),
        student_time: myTime,
        isCompleted,
        resultId,
      };

      return { status: 200, module: newModule, message: "Questions get!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async addVideoInModuleById(
    id: string,
    data: {
      videoUrl: string;
      thumbnailUrl: string;
      title: string;
    }
  ) {
    try {
      const module = await Module.findByIdAndUpdate(
        id,
        {
          $addToSet: { videos: data },
        },
        { new: true }
      );

      return { status: 200, module: module };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async getAllModulesVideos(id: string, search: string) {
    try {
      const module = await Module.findById(id);

      if (!module) {
        return { status: 404, module: null, message: "Module not found!!" };
      }

      let { _id, name, videos } = module.toObject();

      if (search) {
        const searchLower = search.toLowerCase();
        videos = videos.filter((video: any) =>
          video.title?.toLowerCase().includes(searchLower)
        );
      }

      return { status: 200, module: { _id, name, videos } };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async removeVideoFromModule(moduleId: string, videoId: string) {
    try {
      const module = await Module.findByIdAndUpdate(
        moduleId,
        {
          $pull: {
            videos: { _id: videoId },
          },
        },
        { new: true }
      );
      if (!module) {
        return { status: 404, module: null, message: "Module not found!!" };
      }

      const { _id, name, videos } = module.toObject();

      return { status: 200, module: { _id, name, videos } };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}
