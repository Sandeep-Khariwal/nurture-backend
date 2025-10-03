import { randomUUID } from "crypto";
import Query from "../models/query.model";
import { Stats } from "fs";

export class QueryService {
  public async createQuery(data: {
    studentId: string;
    query: string;
    examId: string;
  }) {
    try {
      const query = new Query();
      query._id = `QURY-${randomUUID()}`;
      query.query = data.query;
      query.studentId = data.studentId;
      query.examId = data.examId;
      query.isDeleted = false;
      query.isPublic = false;

      const savedQuery = await query.save(); // Save first

      const newQuery = await savedQuery.populate({
        path: "examId",
        select: ["_id", "name"],
      });

      const { examId, ...rest } = newQuery.toObject() as any;

      return {
        status: 200,
        query: { ...rest, examName: examId?.name ? examId?.name : "" },
        message: "Query created!!",
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getQueryForStudent(id: string, exam: string) {
    try {
      const queries = await Query.find({
        examId: exam,
        isDeleted: false,
      })
        .populate([
          {
            path: "examId",
            select: ["_id", "name"],
          },
        ])
        .sort({ createdAt: -1 });

      const query = queries.filter((qry) => {
        if (qry.isPublic || qry.studentId === id) {
          return qry;
        }
      });

      if (query && query.length === 0) {
        return { status: 200, query: [], message: "List is empty!!" };
      }

      // const newQuery = query.toObject() as any
      const querie = query.map((q) => {
        const { examId, ...rest } = q.toObject() as any;

        return {
          ...rest,
          examName: examId.name,
        };
      });

      return { status: 200, query: querie };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async getQueryForAdmin() {
    try {
      const queries = await Query.find({ isDeleted: false })
        .populate([
          {
            path: "examId",
            select: ["_id", "name"],
          },
        ])
        .sort({ createdAt: -1 });

      if (queries && queries.length === 0) {
        return { status: 200, query: [], message: "List is empty!!" };
      }
      // const newQuery = query.toObject() as any
      const querie = queries.map((q) => {
        const { examId, ...rest } = q.toObject() as any;

        return {
          ...rest,
          examName: examId.name,
        };
      });
      return { status: 200, query: querie };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async updateQueryById(
    id: string,
    data: { isPublic: boolean; reply: string }
  ) {
    try {
      const query = await Query.findByIdAndUpdate(id, data, { new: true });

      if (!query) {
        return { status: 404, message: "Query not found!!" };
      }

      return { status: 200, query };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}
