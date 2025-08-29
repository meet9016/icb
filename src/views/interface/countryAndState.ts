export interface State {
    id:number
    full_name:string
    short_name:string
    code:string
}


export interface Country {
    id: number
    country_name: string
    code: string
    states: State[]
}
