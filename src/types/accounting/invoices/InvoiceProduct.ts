export interface InvoiceProduct {
    id: number,
    name: string,
    amount_excl_tax: number,
    quantity: number,
    tax_rate: number,
    discount_percentage: number,
    discount_amount: number
}