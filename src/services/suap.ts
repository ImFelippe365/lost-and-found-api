import {
  ISuapAPIUserDataResponseSchema,
  SuapAPITokenResponse,
  SuapAPIUserDataResponseSchema,
} from './../schemas/SuapAPI';
import axios from 'axios';

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
    const { data } = await api.post('autenticacao/token/', {
      username: this.registration,
      password: this.password,
    });

    const { access, refresh } = SuapAPITokenResponse.parse(data);

    this.token = access;
    this.refreshToken = refresh;
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
