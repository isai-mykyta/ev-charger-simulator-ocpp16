import { IsNotEmpty, IsString, Length } from "class-validator";

export class ChangeConfigurationReqDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  public key: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  public value: string;
}
