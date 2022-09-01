// eslint-disable-next-line prettier/prettier
// eslint-disable prettier/prettier
import * as lowdb from 'lowdb'; 
import * as FileSync from 'lowdb/adapters/FileSync';

type Ticket = { 
  ticketId: number;
  ticketType: string;     
  ipfs_uri: string;
};

type User = {
  userId: number;
  firstName: string;
  lastName: string;
  walletAddress: string;
};

type Event = { 
  eventId: number;
  eventType: string;
  tickets: number;
};

type Database = { 
  tickets: Ticket[];
  Users: User[];
  Events: Event[];
};

export class Database { 
    private db: lowdb.LowdbSync<any>;

    constructor() {
        this.initialize(); 
    }

    private initialize() {
        this.db = new lowdb.LowdbSync<any>({
            adapter: 'memory',
            auto_reconnect: true,
        });
    } 

    private connect() {
        await this.db.open();
    }

    private write(data: any) {
        this.db.push(data).write();
    } 

    public getTickets() {
        const tickets = this.db.get('tickets');
        return tickets;
    } 

    public async getUsers() {
        const users = await this.db.get('users');
        return users;
    } 

    public async getEvents() {
        const events = await this.db.get('events');
        return events;
    }
}

