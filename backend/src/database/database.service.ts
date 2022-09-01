interface User { 
    id: number;
    name: string;
    walletAddress: string;
    tickets: Array<Tickets>; 
    events: Array<Event>;
}

interface Event { 
    id: number;
    name: string;
    ticketTypes: Array<string>;
    tickets: Array<Ticket>;
}

interface Ticket {
    id: number;
    name: string;
    address: string;
    price: number;
    ticketTypes: Array<string>;
    ipfs_uri: string;
}

async function getTicket(id: number) : string {
    const ticket: string; 
    return ticket; 
}

async function getEvent(id: number) : string {
    const event: string; 
    return event; 
} 

async function getTicketTypeByEvent(event: string) : Array<string> {
    const ticketTypes: Array<string>;
    return ticketTypes;
} 

async function getTicketTypeByTicketType(ticketType: string) : Array<string> {
    const ticketTypes: Array<string>;
    return ticketTypes;
} 

async function getTicketsOwnedByEvent(event: string) : Array<Ticket> { 
    const tickets: Array<Ticket>;
    return tickets;
} 

async function getTicketsOwnedByUser(user: string) : Array<Ticket> { 
    const tickets: Array<Ticket>;
    return tickets;
} 


