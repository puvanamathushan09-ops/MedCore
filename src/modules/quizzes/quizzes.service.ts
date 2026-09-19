import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createQuizDto: CreateQuizDto, userId: string) {
    const { title, description, subjectId, topicId, questions } =
      createQuizDto;

    const creator = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!creator) {
      throw new NotFoundException('User not found');
    }

    if (
      creator.role !== 'MEDICAL_REVIEWER' &&
      creator.role !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Only medical reviewers and admins can create quizzes',
      );
    }

    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (topicId) {
      const topic = await this.prisma.topic.findUnique({
        where: { id: topicId },
      });

      if (!topic) {
        throw new NotFoundException('Topic not found');
      }

      if (topic.subjectId !== subjectId) {
        throw new BadRequestException(
          'Topic does not belong to the selected subject',
        );
      }
    }

    for (const question of questions) {
      if (question.options.length < 4 || question.options.length > 5) {
        throw new BadRequestException(
          'Each question must have between 4 and 5 options',
        );
      }

      const correctOptions = question.options.filter(
        (option) => option.isCorrect,
      );

      if (correctOptions.length !== 1) {
        throw new BadRequestException(
          'Each question must have exactly one correct option',
        );
      }
    }

    return this.prisma.quiz.create({
      data: {
        title,
        description,
        subjectId,
        topicId,
        createdById: userId,
        isPublished: false,
        questions: {
          create: questions.map((question, questionIndex) => ({
            question: question.question,
            explanation: question.explanation,
            orderIndex: question.orderIndex ?? questionIndex,
            options: {
              create: question.options.map((option, optionIndex) => ({
                optionText: option.optionText,
                isCorrect: option.isCorrect,
                orderIndex: option.orderIndex ?? optionIndex,
              })),
            },
          })),
        },
      },
      include: {
        subject: true,
        topic: true,
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });
  }

  async findAll(includeUnpublished = false) {
    return this.prisma.quiz.findMany({
      where: includeUnpublished ? {} : { isPublished: true },
      include: {
        subject: true,
        topic: true,
        questions: {
          select: {
            id: true,
            question: true,
            explanation: true,
            orderIndex: true,
            options: {
              select: {
                id: true,
                optionText: true,
                orderIndex: true,
              },
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, includeUnpublished = false) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        subject: true,
        topic: true,
        questions: {
          select: {
            id: true,
            question: true,
            explanation: true,
            orderIndex: true,
            options: {
              select: {
                id: true,
                optionText: true,
                orderIndex: true,
              },
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (!includeUnpublished && !quiz.isPublished) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto, userId: string) {
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!existingQuiz) {
      throw new NotFoundException('Quiz not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      !user ||
      (user.role !== 'MEDICAL_REVIEWER' && user.role !== 'ADMIN')
    ) {
      throw new ForbiddenException(
        'Only medical reviewers and admins can update quizzes',
      );
    }

    const { title, description, subjectId, topicId } = updateQuizDto;

    return this.prisma.quiz.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(subjectId !== undefined && { subjectId }),
        ...(topicId !== undefined && { topicId }),
      },
      include: {
        subject: true,
        topic: true,
      },
    });
  }

  async publish(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      !user ||
      (user.role !== 'MEDICAL_REVIEWER' && user.role !== 'ADMIN')
    ) {
      throw new ForbiddenException(
        'Only medical reviewers and admins can publish quizzes',
      );
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return this.prisma.quiz.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      !user ||
      (user.role !== 'MEDICAL_REVIEWER' && user.role !== 'ADMIN')
    ) {
      throw new ForbiddenException(
        'Only medical reviewers and admins can unpublish quizzes',
      );
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return this.prisma.quiz.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  async remove(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete quizzes');
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return this.prisma.quiz.delete({
      where: { id },
    });
  }


  async submit(id: string, submitQuizDto: SubmitQuizDto, studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true },
    });

    if (!student) {
      throw new NotFoundException('User not found');
    }

    if (student.role !== 'STUDENT') {
      throw new ForbiddenException('Only students can submit quizzes');
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id,
        isPublished: true,
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const questionMap = new Map(
      quiz.questions.map((question) => [question.id, question]),
    );

    let score = 0;
    const results: Array<{
      questionId: string;
      selectedOptionId: string | null;
      isCorrect: boolean;
    }> = [];

    for (const answer of submitQuizDto.answers) {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        throw new BadRequestException(
          `Invalid question: ${answer.questionId} `,
        );
      }

      let isCorrect = false;

      if (answer.optionId) {
        const selectedOption = question.options.find(
          (option) => option.id === answer.optionId,
        );

        if (!selectedOption) {
          throw new BadRequestException(
            `Invalid option for question: ${answer.questionId} `,
          );
        }

        if (selectedOption.isCorrect) {
          score++;
          isCorrect = true;
        }
      }

      results.push({
        questionId: answer.questionId,
        selectedOptionId: answer.optionId ?? null,
        isCorrect,
      });
    }

    const total = quiz.questions.length;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        studentId,
        score,
        total,
        answers: {
          create: submitQuizDto.answers.map((answer) => ({
            questionId: answer.questionId,
            optionId: answer.optionId,
          })),
        },
      },
    });

    return {
      attemptId: attempt.id,
      score,
      total,
      percentage: total > 0 ? Math.round((score / total) * 100) : 0,
      results,
    };
  }

  async getMyAttempts(studentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'STUDENT') {
      throw new ForbiddenException('Only students can view quiz attempts');
    }

    const attempts = await this.prisma.quizAttempt.findMany({
      where: { studentId },
      orderBy: { completedAt: 'desc' },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: {
              select: {
                id: true,
                title: true,
              },
            },
            topic: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return attempts.map((attempt) => ({
      attemptId: attempt.id,
      quizId: attempt.quiz.id,
      quizTitle: attempt.quiz.title,
      subject: {
        id: attempt.quiz.subject.id,
        name: attempt.quiz.subject.title,
      },
      topic: attempt.quiz.topic
        ? {
          id: attempt.quiz.topic.id,
          name: attempt.quiz.topic.title,
        }
        : null,
      score: attempt.score,
      total: attempt.total,
      percentage:
        attempt.total > 0
          ? Math.round((attempt.score / attempt.total) * 100)
          : 0,
      completedAt: attempt.completedAt,
    }));
  }
}

