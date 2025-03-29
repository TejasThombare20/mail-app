import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { LogHistoryService } from "../services/LogHistory.service";

export class LogHistoryController {

    constructor (private logHistoryService: LogHistoryService) {

    }

getUserEmailLogs = async (req : AuthRequest , res : Response)  : Promise<void> =>{

    try {
        const user_id = req.user?.userId!

        const last_sent_at  = req.params.last_sent_at || null

        console.log('last',last_sent_at)
        
        const userHistoryLogData = await this.logHistoryService.getEmailLogs(user_id ,last_sent_at)

        if(!userHistoryLogData){
            res.status(404).json({ message : "not able to fetch the user's data ", error : "falied to fetch log history", success : false })
            return;  
        }

        res.status(200).json({data: userHistoryLogData , message : "User log history fetch successfully" , success : true})


    } catch (error) {
        res.status(500).json({ message  : "Internal Server Error" , error : "failed to fetch user log history" , success : false })
        return;
    }
}

}