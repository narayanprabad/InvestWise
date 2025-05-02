declare module 'ml-regression' {
  export class PolynomialRegression {
    constructor(x: number[][], y: number[], degree: number);
    predict(x: number[]): number;
    score(x: number[][], y: number[]): number;
  }
}