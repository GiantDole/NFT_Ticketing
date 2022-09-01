interface User { 
    id: number;
    name: string;
    walletAddress: string;
    tickets: Array<Ticket>; 
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

async function getTicket(id: number) : Promise<string> {
    const ticket: string = ''; 
    return ticket; 
}

async function getEvent(id: number) : Promise<string> {
    const event: string = ''; 
    return event; 
} 

async function getTicketTypeByEvent(event: string) : Promise<string[]> {
    const ticketTypes: Array<string> = [];
    return ticketTypes;
} 

async function getTicketTypeByTicketType(ticketType: string) : Promise<string[]> {
    const ticketTypes: Array<string> = [];
    return ticketTypes;
} 

async function getTicketsOwnedByEvent(event: string): Promise<Ticket[]> {
  const tickets: Array<Ticket> = [];
  return tickets;
} 

async function getTicketsOwnedByUser(user: string) : Promise<Ticket[]> { 
    const tickets: Array<Ticket> = [];
    return tickets;
} 


