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
}