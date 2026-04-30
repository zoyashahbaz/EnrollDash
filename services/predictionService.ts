import { linearRegression, linearRegressionLine, rSquared } from 'simple-statistics';
import { enrollmentService } from './enrollmentService';

export interface PredictionResult {
  nextYear: number;
  predictedEnrollment: number;
  rSquared: number;
  message?: string;
}

export const predictionService = {
  calculatePrediction(): PredictionResult | { prediction: null; message: string } {
    const rows = enrollmentService.getAll();
    
    if (rows.length < 2) {
      return { 
        prediction: null, 
        message: "Not enough historical data (minimum 2 years required)." 
      };
    }
    
    const dataPoints = rows.map(r => [r.year, r.total_enrolled]);
    const l = linearRegression(dataPoints);
    const predict = linearRegressionLine(l);
    const r2 = rSquared(dataPoints, predict);
    
    const lastYear = rows[rows.length - 1].year;
    const nextYear = lastYear + 1;
    const predictedEnrollment = Math.round(predict(nextYear));
    
    return {
      nextYear,
      predictedEnrollment,
      rSquared: r2,
    };
  }
};
