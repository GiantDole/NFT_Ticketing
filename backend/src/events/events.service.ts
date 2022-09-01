import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
//import { ethers } from "ethers";
//import 'dotenv/config';
//import * as managerJson from "../artifacts/contracts/TicketManager.sol/TicketManager.json";

@Injectable()
export class EventsService {
  listEventsByTicketType(id: number) {
    return `the events ticket types looked up by the the ${id} ser`;
  }

  listEventById(id: number) {
    return `the event looked up by ${id} ser`;
  }
  list() {
    return 'all the events ser';
  }

  create(createEventDto: CreateEventDto) {
    return 'This action adds a new event';
  }

  findAll() {
    return `This action returns all events`;
  }

  findOne(id: number) {
    //  const event = await managerContract.getEventByID(id);

    return `This action returns a #${id} and ${event}`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
