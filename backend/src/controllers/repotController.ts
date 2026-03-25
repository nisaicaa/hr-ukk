// src/controllers/reportController.ts

import {Request,Response} from "express"
import {getHRReportData,getFinanceReportData,getAdminReportData} from "../service/repotService"


export const hrReport = async(req:Request,res:Response)=>{

 const {month,year}=req.query

 const data = await getHRReportData(Number(month),Number(year))

 res.json(data)

}



export const financeReport = async(req:Request,res:Response)=>{

 const {month,year}=req.query

 const data = await getFinanceReportData(Number(month),Number(year))

 res.json(data)

}



export const adminReport = async(req:Request,res:Response)=>{

 const {month,year}=req.query

 const data = await getAdminReportData(Number(month),Number(year))

 res.json(data)

}