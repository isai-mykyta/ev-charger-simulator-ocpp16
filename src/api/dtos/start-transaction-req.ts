import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from "class-validator";

export class StartTransactionReqDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  public idTag: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  public connectorId: number;
}
