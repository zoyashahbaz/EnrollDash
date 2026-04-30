export interface Enrollment {
  id: number;
  year: number;
  total_enrolled: number;
  class_name: string;
  college_name: string;
  city_name: string;
}

export interface Prediction {
  nextYear: number;
  predictedEnrollment: number;
  rSquared?: number;
}
