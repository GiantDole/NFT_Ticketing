import { PartialType } from '@nestjs/mapped-types';
import { CreateOracleDto } from './create-oracle.dto';

export class UpdateOracleDto extends PartialType(CreateOracleDto) {}
