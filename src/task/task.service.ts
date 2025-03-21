import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getTasks() {
    return this.prisma.task.findMany();
  }

  async createTask(title: string, description: string) {
    const user: User = {
      id: '',
      name: '',
      email: '',
      password: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
    };
    return this.prisma.task.create({
      data: { title, description, userId: user.id },
    });
  }
}
