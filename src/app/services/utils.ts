export class Utils {
    static formatarData(data: any) {
        if (!data) return '';
        const partes = data.split('-');
        if (partes.length !== 3) return data; // Retorna a data original      
        return `${partes[2]}/${partes[1]}/${partes[0]}`; // Formato DD/MM/AAAA
    }
}