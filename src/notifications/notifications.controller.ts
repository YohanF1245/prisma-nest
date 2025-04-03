import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { MarkNotificationReadDto } from './dto/mark-notification-read.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Endpoint d'administration pour créer des notifications manuellement
  @Post()
  @Roles('ADMIN')
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  // Obtenir les notifications de l'utilisateur connecté
  @Get('my')
  @Roles('USER', 'ADMIN')
  findMyNotifications(
    @User('id') userId: string,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.notificationsService.findAll(userId, query);
  }

  // Obtenir le nombre de notifications non lues de l'utilisateur connecté
  @Get('my/unread-count')
  @Roles('USER', 'ADMIN')
  getMyUnreadCount(@User('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  // Marquer toutes les notifications de l'utilisateur connecté comme lues
  @Post('my/mark-all-read')
  @Roles('USER', 'ADMIN')
  markAllAsRead(@User('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  // Supprimer toutes les notifications de l'utilisateur connecté
  @Delete('my')
  @Roles('USER', 'ADMIN')
  removeAllMine(@User('id') userId: string) {
    return this.notificationsService.removeAll(userId);
  }

  // Administration - Obtenir les notifications d'un utilisateur spécifique
  @Get('user/:userId')
  @Roles('ADMIN')
  findAllForUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.notificationsService.findAll(userId, query);
  }

  // Obtenir une notification spécifique
  @Get(':id')
  @Roles('USER', 'ADMIN')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.findOne(id);
  }

  // Mettre à jour une notification
  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  // Marquer une notification comme lue/non lue
  @Patch(':id/read')
  @Roles('USER', 'ADMIN')
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() markReadDto: MarkNotificationReadDto,
  ) {
    return this.notificationsService.markAsRead(id, markReadDto.isRead);
  }

  // Supprimer une notification
  @Delete(':id')
  @Roles('USER', 'ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.remove(id);
  }
} 