import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AtJwtGuard } from 'src/modules/auth/guards/jwt-at.guard';
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';
import { Request } from 'express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-profile-image')
  @UseGuards(AtJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @UserIdFromJwt() userId: string,
  ) {
    return this.filesService.uploadProfileImage(file, userId);
  }

  @Post('upload-post-image')
  @UseGuards(AtJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadPostImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() { body: { postId } }: Request,
    @UserIdFromJwt() userId: string,
  ) {
    return this.filesService.uploadPostImage(file, userId, postId);
  }

  @UseGuards(AtJwtGuard)
  @Get(':name')
  retrieve(@Param('name') name: string, @UserIdFromJwt() userId: string) {
    return this.filesService.retrieveFile(name, userId);
  }

  @UseGuards(AtJwtGuard)
  @Delete(':name')
  delete(@Param('name') name: string, @UserIdFromJwt() userId: string) {
    return this.filesService.deleteFile(name, userId);
  }
}
