import studentModel from "../models/student.model";

export class StudentService {
  public async updateStudentExamsById(
    id: string,
    exams: { _id: string; name: string }[]
  ) {
    try {
      const student = await studentModel.findById(id);

      if (!student) {
        return { status: 404, message: "User not found!!" };
      }

      const updateExams = exams.map((e, i) => {
        if (i === 0) {
          return {
            _id: e,
            name: e.name,
            is_primary: true,
          };
        } else {
          return {
            _id: e,
            name: e.name,
            is_primary: false,
          };
        }
      });
      const updateExam = await studentModel.findByIdAndUpdate(
        id,
        {
          $set: { exams: updateExams },
        },
        { new: true }
      );
      return {
        status: 200,
        message: "Exams updated!!",
        selectedExam: updateExam,
      };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }

  public async deleteAccount(id: string) {
    try {
      await studentModel.findByIdAndUpdate(id, { isDeleted: true });
      return { status: 200, message: "account deleted" };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async getStudentById(id: string) {
    try {
      let student = await studentModel.findById(id, { isDeleted: false });
      if (!student) {
        return { status: 404, message: "Student not found!!" };
      }
      return {
        status: 200,
        user: student
      };
    } catch (error) {
      const errorObj = { message: error.message, status: 500 };
      return errorObj;
    }
  }
  public async updateResultInStudent(id: string, resultId: string) {
    try {
      await studentModel.findByIdAndUpdate(id, {
        $push: { results: resultId },
      });
      return { status: 200, message: "Result created!!" };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }
  public async updateQuizResultInStudent(id: string, resultId: string) {
    try {
      await studentModel.findByIdAndUpdate(id, {
        $push: { quizResults: resultId },
      });
      return { status: 200, message: "Result created!!" };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }
  public async removeResultFromStudent(id: string, resultId: string) {
    try {
      const cleanResultId = resultId.trim();
      await studentModel.findByIdAndUpdate(
        id,
        {
          $pull: { results: resultId },
        },
        { new: true }
      );
      return { status: 200, message: "Result removed from student!!" };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }
  public async getResultsForExams(examId: string, studentId: string) {
    try {
      const student = await studentModel
        .findById(studentId)
        .select(["_id", "results"])
        .populate([
          {
            path: "results",
            match: { isDeleted: false },
            populate: [
              {
                path: "examId",
                // match: { isDeleted: false },
                select: ["_id", "name"],
              },
              {
                path: "chapterId",
                // match: { isDeleted: false },
                select: ["_id", "name"],
              },
              {
                path: "moduleId",
                // match: { isDeleted: false },
                select: ["_id", "name"],
              },
            ],
          },
        ]);

      if (!student) {
        return { status: 404, message: "Student not found!!" };
      }

      const filteredResults = student.results
        .filter((res: any) => examId === res.examId._id)
        .map((res: any) => {
          const newRes = res.toObject();
          const { examId, chapterId, moduleId, Questions, ...rest } = newRes;

          if (moduleId) {
            return {
              ...rest,
              exam: examId.name,
              chapter: chapterId ? chapterId.name : "",
              module: moduleId?.name ? moduleId.name : "",
            };
          }
        })
        .filter((r) => r);

      return { status: 200, results: filteredResults };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }
  public async updateExamNameForAllStudents(examId: string, name: string) {
    try {
      const result = await studentModel.updateMany(
        {
          "exams._id": examId,
        },
        {
          $set: {
            "exams.$.name": name,
          },
        }
      );

      return {
        status: 200,
        message: `Updated exam name for ${result.modifiedCount} student(s)`,
      };
    } catch (error) {
      return {
        status: 500,
        message: error.message || "Internal Server Error",
      };
    }
  }

  public async updateStudentExam(
    id: string,
    data: { examId: string; firstName: string; lastName: string; email: string }
  ) {
    try {
      const student = await studentModel.findById(id);

      if (!student) {
        return { status: 404, message: "Student not found" };
      }

      let name = "";
      if (data.firstName) {
        name = data.firstName;
      }
      if (data.lastName) {
        name = name + " " + data.lastName;
      }

      // Update exams: set is_primary true for matching examId, false for others
      student.exams = student.exams.map((exam: any) => ({
        ...exam.toObject(), // ensure we're working with plain objects
        is_primary: exam._id.toString() === data.examId,
      }));
      (student.name = name ? name : student.name),
        (student.email = data.email ? data.email : student.email),
        await student.save();

      return { status: 200, student, message: "Student updated!!" };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }

  public async updateQuizStudentInfo(
    id: string,
    data: {
      email: string;
      collegeName: string;
      address: string;
    }
  ) {
    try {
      await studentModel.findByIdAndUpdate(id, data);

      return { status: 200, message: "student update!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async updateSubscriptionInStudent(
    id: string,
    newSubscription: {
      examId: string;
      subscriptionId: string;
      planId: string;
      subscriptionStart: Date;
      subscriptionEnd: Date;
      featuresAccess: {
        accessProModules: boolean;
        accessJournerSoFar: boolean;
        accessAdFree: boolean;
        accessSupportAndNotifications: boolean;
        accessVideoLibrary: boolean;
        accessVideoCombo: boolean;
        accessPrioritySupport: boolean;
      };
    }
  ) {
    try {

      // Then: Push the new subscription
      await studentModel.findByIdAndUpdate(id, {
        $push: {
          subscriptions: newSubscription,
        },
      });

      return { status: 200, message: "student update!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async expireStudentPlan(studentId: string, examId: string) {
    try {
      console.log("expireStudentPlan : ");
      
      const updatedStudent = await studentModel.findByIdAndUpdate(
        studentId,
        { $pull: { subscriptions: { examId } } },
        {
          new: true,
        }
      );

      if (!updatedStudent) {
        return {
          status: 404,
          message: "Subscription not found!!",
        };
      }

      return { status: 200, message: "student update!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async addFcmToeknById(id: string, fcmToken: string) {
    try {
      await studentModel.findByIdAndUpdate(id, {
        $set: { fcmToken: fcmToken },
      });

      return { status: 200, message: "FCM Token updated succesfully!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async getAllStudent() {
    try {
      const students = await studentModel.find({ isDeleted: false });

      if (!students && !students.length) {
        return { status: 400, students: [], message: "Students not found!!" };
      }

      return { status: 200, students: students };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}
