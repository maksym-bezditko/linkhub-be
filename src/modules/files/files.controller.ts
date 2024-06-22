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
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { PostImagesService } from './post-images.service';
import { ProfileImagesService } from './profile-images.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AtJwtGuard } from 'src/modules/auth/guards/jwt-at.guard';
import { UserIdFromJwt } from 'src/decorators/user-id-from-jwt.decorator';
import { Request } from 'express';

@Controller('files')
export class FilesController {
  constructor(
    private readonly postImagesService: PostImagesService,
    private readonly profileImagesService: ProfileImagesService,
  ) {}

  @Post('upload-profile-image')
  @UseGuards(AtJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @UserIdFromJwt() userId: number,
  ) {
    return this.profileImagesService.uploadImage(file, userId);
  }

  @Post('upload-post-image')
  @UseGuards(AtJwtGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async uploadPostImage(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() { body: { postId } }: Request,
    @UserIdFromJwt() userId: number,
  ) {
    return this.postImagesService.uploadImages(files, userId, +postId);
  }

  @Post('retrieve-profile-image')
  async retrieveProfileImage(@Body() { userId }: { userId: number }) {
    return this.profileImagesService.retrieveImage(userId);
  }

  @UseGuards(AtJwtGuard)
  @Get('retrieve-post-image/:name')
  async retrieve(@Param('name') name: string, @UserIdFromJwt() userId: number) {
    return this.postImagesService.retrieveImage(name, userId);
  }

  @UseGuards(AtJwtGuard)
  @Delete('post-image/:name')
  async deletePostImage(
    @Param('name') name: string,
    @UserIdFromJwt() userId: number,
  ) {
    return this.postImagesService.deleteImage(name, userId);
  }

  @UseGuards(AtJwtGuard)
  @Delete('profile-image')
  async deleteProfileImage(@UserIdFromJwt() userId: number) {
    return this.profileImagesService.deleteProfileImage(userId);
  }
}
