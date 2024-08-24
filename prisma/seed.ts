import { prisma } from '../src/utils';

async function seed() {
  await prisma.campus.createMany({
    data: [
      {
        acronym: 'AP',
        name: 'Apodi',
      },
      {
        acronym: 'CA',
        name: 'Caicó',
      },
      {
        acronym: 'CAL',
        name: 'Natal - Cidade Alta',
      },
      {
        acronym: 'CANG',
        name: 'Canguaretama',
      },
      {
        acronym: 'CN',
        name: 'Currais Novos',
      },
      {
        acronym: 'CED',
        name: 'Ceará Mirim',
      },
      {
        acronym: 'CNAT',
        name: 'Natal - Central',
      },
      {
        acronym: 'IP',
        name: 'Ipanguaçu',
      },
      {
        acronym: 'JC',
        name: 'João Câmara',
      },
      {
        acronym: 'MC',
        name: 'Macau',
      },
      {
        acronym: 'MO',
        name: 'Mossoró',
      },
      {
        acronym: 'NC',
        name: 'Nova Cruz',
      },
      {
        acronym: 'PAR',
        name: 'Parnamirim',
      },
      {
        acronym: 'PF',
        name: 'Pau dos Ferros',
      },
      {
        acronym: 'SC',
        name: 'Santa Cruz',
      },
      {
        acronym: 'SGA',
        name: 'São Gonçalo do Amarante',
      },
      {
        acronym: 'SPP',
        name: 'São Paulo do Potengi',
      },
      {
        acronym: 'ZN',
        name: 'Zona Norte',
      },
      {
        acronym: 'ZL',
        name: 'Natal - Zona Leste',
      },
      {
        acronym: 'JUC',
        name: 'Jucurutu',
      },
      {
        acronym: 'LAJ',
        name: 'Lajes',
      },
      {
        acronym: 'PAAS',
        name: 'Parelhas',
      },
    ],
  });
}

seed().then(() => {
  console.log("Campi do IFRN foram salvos no banco")
  prisma.$disconnect();
})