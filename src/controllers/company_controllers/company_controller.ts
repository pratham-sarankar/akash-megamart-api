export default class CompanyController {
    public static parseMargData(data: any) {
        const parsedData = (data as []).map((company: any) => {
            return {
                id: Number(company['rid']),
                sgcode: company['sgcode'],
                scode: company['scode'],
                name: company['name'],
                isDeleted: company['Is_Deleted'] == '0' ? false : true,
            }
        });
        return parsedData;
    }
}