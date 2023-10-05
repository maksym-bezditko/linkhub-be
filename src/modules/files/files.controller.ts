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
import { PostImagesService } from './services/post-images.service';
import { ProfileImagesService } from './services/profile-images.service';
import { FileInterceptor } from '@nestjs/platform-express';
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
  uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @UserIdFromJwt() userId: string,
  ) {
    return this.profileImagesService.uploadImage(file, userId);
  }

  @Post('upload-post-image')
  @UseGuards(AtJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadPostImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() { body: { postId } }: Request,
    @UserIdFromJwt() userId: string,
  ) {
    return this.postImagesService.uploadImage(file, userId, postId);
  }

  @UseGuards(AtJwtGuard)
  @Get('retrieve-profile-image')
  retrieveProfileImage(@UserIdFromJwt() userId: string) {
    return this.profileImagesService.retrieveImage(userId);
  }

  @UseGuards(AtJwtGuard)
  @Get('retrieve-post-image/:name')
  retrieve(@Param('name') name: string, @UserIdFromJwt() userId: string) {
    return this.postImagesService.retrieveImage(name, userId);
  }

  @UseGuards(AtJwtGuard)
  @Delete('post-image/:name')
  deletePostImage(
    @Param('name') name: string,
    @UserIdFromJwt() userId: string,
  ) {
    return this.postImagesService.deleteImage(name, userId);
  }

  @UseGuards(AtJwtGuard)
  @Delete('profile-image/:name')
  deleteProfileImage(
    @Param('name') name: string,
    @UserIdFromJwt() userId: string,
  ) {
    return this.profileImagesService.deleteImage(name, userId);
  }
}
