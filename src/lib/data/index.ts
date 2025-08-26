
export * from './categories';
export * from './dishes';
export * from './ingredients';
export * from './ration-scale';
export * from './regions';
export * from './suppliers';
export * from './units';
export * from './uom';
export * from './users';

const now = new Date();
const formatDate = (date: Date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

const generateRandomId = () => `ORD-${Math.floor(Math.random() * 100000)}`;

export const orders = [
  { id: generateRandomId(), kitchenId: '16', dateGenerated: formatDate(new Date(now.setDate(now.getDate() - 1))), dayRange: '1-7', status: 'Completed' as const },
  { id: generateRandomId(), kitchenId: '7', dateGenerated: formatDate(new Date(now.setDate(now.getDate() - 7))), dayRange: '8-14', status: 'Completed' as const },
  { id: generateRandomId(), kitchenId: '16', dateGenerated: formatDate(new Date(now.setDate(now.getDate() - 14))), dayRange: '15-21', status: 'Pending' as const },
  { id: generateRandomId(), kitchenId: '7', dateGenerated: formatDate(new Date(now.setDate(now.getDate() - 21))), dayRange: '22-28', status: 'Pending' as const },
  { id: generateRandomId(), kitchenId: '16', dateGenerated: formatDate(new Date(now.setDate(now.getDate() - 30))), dayRange: '1-7', status: 'Cancelled' as const },
];
