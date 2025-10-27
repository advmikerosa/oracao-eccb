-- SQL Script para configurar o banco de dados Supabase
-- Execute este script no SQL Editor do Supabase para criar a tabela de orações agendadas

-- Criar tabela para orações agendadas
CREATE TABLE IF NOT EXISTS oracoes_agendadas (
  id BIGSERIAL PRIMARY KEY,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  nome VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_oracoes_agendadas_data ON oracoes_agendadas(data);
CREATE INDEX IF NOT EXISTS idx_oracoes_agendadas_data_horario ON oracoes_agendadas(data, horario);

-- Habilitar Row Level Security (RLS)
ALTER TABLE oracoes_agendadas ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso para permitir leitura e inserção pública
CREATE POLICY "Permitir leitura pública" ON oracoes_agendadas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública" ON oracoes_agendadas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir deleção pública" ON oracoes_agendadas
  FOR DELETE USING (true);

-- Comentários para documentação
COMMENT ON TABLE oracoes_agendadas IS 'Tabela para armazenar orações agendadas no calendário';
COMMENT ON COLUMN oracoes_agendadas.id IS 'ID único da oração agendada';
COMMENT ON COLUMN oracoes_agendadas.data IS 'Data da oração agendada';
COMMENT ON COLUMN oracoes_agendadas.horario IS 'Horário da oração agendada';
COMMENT ON COLUMN oracoes_agendadas.nome IS 'Nome da pessoa que agendou a oração';
COMMENT ON COLUMN oracoes_agendadas.created_at IS 'Data e hora de criação do registro';

-- Verificar tabela existente escala_oracao
-- Esta tabela já existe e armazena as orações registradas
-- Estrutura esperada:
-- CREATE TABLE escala_oracao (
--   id BIGSERIAL PRIMARY KEY,
--   nome VARCHAR(50),
--   data DATE,
--   hora TIME,
--   responsavel VARCHAR(50),
--   observacoes TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
