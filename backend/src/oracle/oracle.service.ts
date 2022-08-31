import { Injectable } from '@nestjs/common';
import { CreateOracleDto } from './dto/create-oracle.dto';
import { UpdateOracleDto } from './dto/update-oracle.dto';

@Injectable()
export class OracleService {
  create(createOracleDto: CreateOracleDto) {
    return 'This action adds a new oracle';
  }

  findAll() {
    return `This action returns all oracle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} oracle`;
  }

  update(id: number, updateOracleDto: UpdateOracleDto) {
    return `This action updates a #${id} oracle`;
  }

  remove(id: number) {
    return `This action removes a #${id} oracle`;
  }
}
