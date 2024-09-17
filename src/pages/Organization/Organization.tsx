import React, { useState } from 'react';
import './style.sass';
import { Input, Modal, Button, Form, Table, Space, DatePicker, Select, Row, Col, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import Breadcrumb from '../../components/Breadcrumb/breadcrumb.tsx';
import Header from '../../components/Header/index.js';
import OrganizationTable from './OrganizationTable.tsx';
import { SearchOutlined } from '@ant-design/icons';
import { TopButtons } from '../../components/TopButtons/TopButtons.tsx';
import api from '../../connection/api';

const { Option } = Select;

interface TeamData {
  key: string;
  name: string;
  description: string;
}

const Organization: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [teams, setTeams] = useState<TeamData[]>([]);

  const showModal = () => {
    form.resetFields();
    setTeams([]);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setTeams([]);
  };

  const handleAddTeam = () => {
    const newTeam: TeamData = {
      key: `${Date.now()}`,
      name: '',
      description: '',
    };
    setTeams([...teams, newTeam]);
  };

  const handleDeleteTeam = (key: string) => {
    setTeams(teams.filter((team) => team.key !== key));
  };

  const handleTeamChange = (key: string, field: string, value: string) => {
    setTeams(
      teams.map((team) => (team.key === key ? { ...team, [field]: value } : team))
    );
  };

  const handleSubmit = () => {
    form
        .validateFields()
        .then(async (values) => {
            const organizationData = {
                name: values.name,
                taxId: values.taxId,
                email: values.email,
                phone: values.phone,
                address: values.address,
                teams: teams.map((team) => ({
                    name: team.name,
                    description: team.description,
                })),
            };

            try {
                await api.post('/api/organizations/organizations', organizationData);
                message.success('Organização criada com sucesso!');
                setIsModalOpen(false);
                form.resetFields();
                setTeams([]);
            } catch (error) {
                message.error('Erro ao criar organização');
            }
        })
        .catch((errorInfo) => {
            console.log('Erro na validação:', errorInfo);
        });
};


  const teamColumns = [
    {
      title: 'Nome do Time',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TeamData) => (
        <Input
          value={text}
          onChange={(e) => handleTeamChange(record.key, 'name', e.target.value)}
          placeholder="Nome do Time"
        />
      ),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: TeamData) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTeamChange(record.key, 'description', e.target.value)
          }
          placeholder="Descrição"
        />
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: TeamData) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteTeam(record.key)}
        />
      ),
    },
  ];

  return (
    <div>
      <Header />
      <div className="container-user">
        <div className="table">
          <Breadcrumb />
          <div className="filters-history" style={{ marginTop: 10 }}>
            <div className="left-filters">
              <Input
                size="middle"
                placeholder="Pesquisar"
                prefix={<SearchOutlined style={{ color: '#FF426B' }} />}
                style={{
                  height: 55,
                  borderRadius: 15,
                  backgroundColor: '#192831',
                  border: 'none',
                  color: 'white',
                  marginRight: 15,
                }}
              />
            </div>
            <div className="right-filters">
              <TopButtons isDeletable />
              <div className="button-history">
                <button type="submit" onClick={showModal} style={{ marginLeft: 15 }}>
                  <p>Cadastrar</p>
                </button>
              </div>
            </div>
          </div>
          <OrganizationTable />
        </div>
      </div>

      {/* Modal para cadastro da organização */}
      <Modal
        title="Cadastrar Organização"
        visible={isModalOpen}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Salvar
          </Button>,
        ]}
        bodyStyle={{ maxHeight: '70vh', overflowX: 'hidden', overflowY: 'auto' }}
      >
        {/* Formulário para os dados da organização */}
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Nome da Organização"
                name="name"
                rules={[{ required: true, message: 'Por favor, insira o nome da organização' }]}
              >
                <Input placeholder="Nome da Organização" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="CNPJ ou ID Fiscal" name="taxId">
                <Input placeholder="CNPJ ou ID Fiscal" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="E-mail" name="email">
                <Input placeholder="E-mail" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Telefone" name="phone">
                <Input placeholder="Telefone" />
              </Form.Item>
            </Col>
          </Row>

          {/* Endereço */}
          <Form.Item label="Endereço">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name={['address', 'street']}
                  label="Rua"
                  rules={[{ required: true, message: 'Rua é obrigatória' }]}
                >
                  <Input placeholder="Rua" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={['address', 'number']}
                  label="Número"
                  rules={[{ required: true, message: 'Número é obrigatório' }]}
                >
                  <Input placeholder="Número" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['address', 'complement']} label="Complemento">
                  <Input placeholder="Complemento" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name={['address', 'city']}
                  label="Cidade"
                  rules={[{ required: true, message: 'Cidade é obrigatória' }]}
                >
                  <Input placeholder="Cidade" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={['address', 'state']}
                  label="Estado"
                  rules={[{ required: true, message: 'Estado é obrigatório' }]}
                >
                  <Input placeholder="Estado" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['address', 'zipCode']} label="CEP">
                  <Input placeholder="CEP" />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>

          {/* Tabela para adicionar times */}
          <div style={{ marginTop: 20 }}>
            <Space style={{ marginBottom: 16 }}>
              <Button type="dashed" onClick={handleAddTeam} icon={<PlusOutlined />}>
                Adicionar Time
              </Button>
            </Space>
            <Table
              columns={teamColumns}
              dataSource={teams}
              pagination={false}
              rowKey="key"
            />
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Organization;
