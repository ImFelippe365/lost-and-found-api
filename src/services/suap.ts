import { AppError } from './../helpers/errors.helper';
import {
  ISuapAPIUserDataResponseSchema,
  SuapAPITokenResponse,
  SuapAPIUserDataResponseSchema,
} from './../schemas/SuapAPI';
import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: 'https://suap.ifrn.edu.br/api/v2/',
});

export class SuapAPI {
  registration: string = '';
  password: string = '';
  token: string | null = null;
  refreshToken: string | null = null;

  constructor(registration: string, password: string) {
    this.registration = registration;
    this.password = password;
  }

  async authenticate() {
    try {
      const { data } = await api.post('autenticacao/token/', {
        username: this.registration,
        password: this.password,
      });

      const { access, refresh } = SuapAPITokenResponse.parse(data);

      this.token = access;
      this.refreshToken = refresh;
    } catch (e) {
      if (e instanceof AxiosError) {
        throw new AppError(
          e.request?.data?.detail || 'Houve um erro ao autenticar com o SUAP',
          e.status || 500,
        );
      }
    }
  }

  async getUserData(): Promise<ISuapAPIUserDataResponseSchema> {
    const { data } = await api.get('minhas-informacoes/meus-dados/', {
      headers: {
        Authorization: 'Bearer ' + this.token,
      },
    });

    return SuapAPIUserDataResponseSchema.parse(data);
  }
}
