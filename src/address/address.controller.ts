import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/guards/roles.guard';
import { Roles } from '../roles/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  create(@Body() createAddressDto: CreateAddressDto, @User() user: any) {
    // Vérifier si l'utilisateur peut créer une adresse pour cet utilisateur
    if (user.id !== createAddressDto.userId && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à créer une adresse pour cet utilisateur");
    }
    
    return this.addressService.create(createAddressDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.addressService.findAll();
  }

  @Get('user/:userId')
  findAllByUserId(@Param('userId') userId: string, @User() user: any) {
    // Vérifier si l'utilisateur peut voir les adresses de cet utilisateur
    if (user.id !== userId && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à voir les adresses de cet utilisateur");
    }
    
    return this.addressService.findAllByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: any) {
    const address = await this.addressService.findOne(id);
    
    // Vérifier si l'utilisateur peut voir cette adresse
    if (user.id !== address.userId && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à voir cette adresse");
    }
    
    return address;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @User() user: any,
  ) {
    const address = await this.addressService.findOne(id);
    
    // Vérifier si l'utilisateur peut mettre à jour cette adresse
    if (user.id !== address.userId && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à mettre à jour cette adresse");
    }
    
    return this.addressService.update(id, updateAddressDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User() user: any) {
    const address = await this.addressService.findOne(id);
    
    // Vérifier si l'utilisateur peut supprimer cette adresse
    if (user.id !== address.userId && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à supprimer cette adresse");
    }
    
    return this.addressService.remove(id);
  }

  @Patch(':id/set-primary')
  async setPrimary(@Param('id') id: string, @User() user: any) {
    const address = await this.addressService.findOne(id);
    
    // Vérifier si l'utilisateur peut définir cette adresse comme primaire
    if (user.id !== address.userId && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à définir cette adresse comme primaire");
    }
    
    return this.addressService.setPrimaryAddress(id, address.userId);
  }

  @Get('user/:userId/shipping')
  async getDefaultShippingAddress(@Param('userId') userId: string, @User() user: any) {
    // Vérifier si l'utilisateur peut voir l'adresse de livraison par défaut de cet utilisateur
    if (user.id !== userId && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à voir l'adresse de livraison par défaut de cet utilisateur");
    }
    
    return this.addressService.getDefaultShippingAddress(userId);
  }

  @Get('user/:userId/billing')
  async getDefaultBillingAddress(@Param('userId') userId: string, @User() user: any) {
    // Vérifier si l'utilisateur peut voir l'adresse de facturation par défaut de cet utilisateur
    if (user.id !== userId && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à voir l'adresse de facturation par défaut de cet utilisateur");
    }
    
    return this.addressService.getDefaultBillingAddress(userId);
  }
} 