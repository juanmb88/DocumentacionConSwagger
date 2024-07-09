import winston from "winston";
import dotenv from "dotenv";
dotenv.config();

let nivelesErrores = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    debug: 5
  }

const transporteDesarrollo = new winston.transports.Console(
    {
      level: "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(
          {
            colors: { fatal: "bold white redBG",
                      error: "bold white redBG", 
                      warn: "bold white yellowBG",
                      info: "bold white greenBG",
                      http:"bold white greenBG",
                      debug : "bold white yellowBG"
                  }
        }
        ),
        winston.format.simple()
      )
    }        
  );
  
const transporteProduccion = new winston.transports.File(
    {
      level: "info",
      filename: "./errorLogs.log",
      format: winston.format.combine( 
        winston.format.timestamp(),
        winston.format.json()

      )
    }        
  );

export const logger = winston.createLogger(
    {
    level: nivelesErrores,
    transports :[  transporteProduccion  ]
    }
  );

  if (process.env.MODE === "dev") {
    logger.add(transporteDesarrollo);
  };