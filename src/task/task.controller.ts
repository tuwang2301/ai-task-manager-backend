import { Body, Controller, Get, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './task.dto';

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  async getTasks() {
    return await this.taskService.getTasks();
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    const { title, description } = createTaskDto;
    return this.taskService.createTask(title, description);
  }
}
