import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class StopTransactionReqDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  public idTag: string;
}
