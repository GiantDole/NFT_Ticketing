import { Test, TestingModule } from '@nestjs/testing';
import { OrganizersController } from './organizers.controller';
import { OrganizersService } from './organizers.service';

describe('OrganizersController', () => {
  let controller: OrganizersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizersController],
      providers: [OrganizersService],
    }).compile();

    controller = module.get<OrganizersController>(OrganizersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
