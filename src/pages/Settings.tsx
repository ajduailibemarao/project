import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User, Building, Shield, Database, Bell, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Schema for company settings form
const companySettingsSchema = z.object({
  companyName: z.string().min(1, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ deve ter pelo menos 14 caracteres'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  cep: z.string().min(8, 'CEP deve ter pelo menos 8 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  email: z.string().email('Email inválido'),
  website: z.string().optional(),
  logo: z.string().optional(),
});

// Schema for user settings form
const userSettingsSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  currentPassword: z.string().min(6, 'Senha atual deve ter pelo menos 6 caracteres'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres').optional(),
  confirmPassword: z.string().optional(),
}).refine(data => !data.newPassword || data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Schema for notification settings form
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  newBidding: z.boolean(),
  biddingUpdates: z.boolean(),
  newPenalty: z.boolean(),
  contractExpiration: z.boolean(),
  systemUpdates: z.boolean(),
});

type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;
type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  
  // Company settings form
  const companyForm = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      companyName: 'Prefeitura Municipal de Exemplo',
      cnpj: '12.345.678/0001-90',
      address: 'Av. Principal, 1000',
      city: 'Cidade Exemplo',
      state: 'EX',
      cep: '12345-678',
      phone: '(11) 1234-5678',
      email: 'contato@prefeituraexemplo.gov.br',
      website: 'www.prefeituraexemplo.gov.br',
      logo: '',
    }
  });
  
  // User settings form
  const userForm = useForm<UserSettingsFormData>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });
  
  // Notification settings form
  const notificationForm = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      newBidding: true,
      biddingUpdates: true,
      newPenalty: true,
      contractExpiration: true,
      systemUpdates: false,
    }
  });
  
  // Handle company settings form submission
  const onCompanySubmit = (data: CompanySettingsFormData) => {
    console.log('Company settings:', data);
    toast.success('Configurações da empresa atualizadas com sucesso!');
  };
  
  // Handle user settings form submission
  const onUserSubmit = (data: UserSettingsFormData) => {
    console.log('User settings:', data);
    toast.success('Configurações do usuário atualizadas com sucesso!');
  };
  
  // Handle notification settings form submission
  const onNotificationSubmit = (data: NotificationSettingsFormData) => {
    console.log('Notification settings:', data);
    toast.success('Configurações de notificação atualizadas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('company')}
            className={`${
              activeTab === 'company'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Building className="inline-block h-5 w-5 mr-2" />
            Empresa
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`${
              activeTab === 'user'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <User className="inline-block h-5 w-5 mr-2" />
            Usuário
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Shield className="inline-block h-5 w-5 mr-2" />
            Segurança
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`${
              activeTab === 'database'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Database className="inline-block h-5 w-5 mr-2" />
            Banco de Dados
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Bell className="inline-block h-5 w-5 mr-2" />
            Notificações
          </button>
        </nav>
      </div>
      
      {/* Company Settings */}
      {activeTab === 'company' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Configurações da Empresa</h2>
          <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  id="companyName"
                  {...companyForm.register('companyName')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {companyForm.formState.errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{companyForm.formState.errors.companyName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
                  CNPJ
                </label>
                <input
                  type="text"
                  id="cnpj"
                  {...companyForm.register('cnpj')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {companyForm.formState.errors.cnpj && (
                  <p className="mt-1 text-sm text-red-600">{companyForm.formState.errors.cnpj.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <input
                  type="text"
                  id="address"
                  {...companyForm.register('address')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {companyForm.formState.errors.address && (
                  <p className="mt-1 text-sm text-red-600">{companyForm.formState.errors.address.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Cidade
                  </label>
                  <input
                    type="text"
                    id="city"
                    {...companyForm.register('city')}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {companyForm.formState.errors.city && (
                    <p className="mt-1 text-sm text-red-600">{companyForm.formState.errors.city.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <input
                    type="text"
                    id="state"
                    {...companyForm.register('state')}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {companyForm.formState.errors.state && (
                    <p className="mt-1 text-sm text-red-600">{companyForm.formState.errors.state.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
                  CEP
                </label>
                <input
                  type="text"
                  id="cep"
                  {...companyForm.register('cep')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {companyForm.formState.errors.cep && (
                  <p className="mt-1 text-sm text-red-600">{companyForm.formState.errors.cep.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="text"
                  id="phone"
                  {...companyForm.register('phone')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {companyForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{companyForm.formState.errors.phone.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...companyForm.register('email')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {companyForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{companyForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="text"
                  id="website"
                  {...companyForm.register('website')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {companyForm.formState.errors.website && (
                  <p className="mt-1 text-sm text-red-600">{companyForm.formState.errors.website.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                  Logo (URL)
                </label>
                <input
                  type="text"
                  id="logo"
                  {...companyForm.register('logo')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {companyForm.formState.errors.logo && (
                  <p className="mt-1 text-sm text-red-600">{companyForm.formState.errors.logo.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* User Settings */}
      {activeTab === 'user' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Configurações do Usuário</h2>
          <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  {...userForm.register('name')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {userForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{userForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...userForm.register('email')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {userForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{userForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Senha Atual
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  {...userForm.register('currentPassword')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {userForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{userForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <input
                  type="password"
                  id="newPassword"
                  {...userForm.register('newPassword')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {userForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{userForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...userForm.register('confirmPassword')}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {userForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{userForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Configurações de Segurança</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900">Autenticação de Dois Fatores</h3>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Adicione uma camada extra de segurança à sua conta. Além da sua senha, você precisará fornecer um código de autenticação.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Configurar
                  </button>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900">Sessões Ativas</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Dispositivos que estão atualmente conectados à sua conta. Encerre sessões que você não reconhece.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Windows 10 - Chrome</p>
                        <p className="text-xs text-gray-500">São Paulo, Brasil • Ativo agora</p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Atual
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">macOS - Safari</p>
                        <p className="text-xs text-gray-500">Rio de Janeiro, Brasil • Último acesso: 2 dias atrás</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X className="h-3 w-3 mr-1 text-red-500" />
                          Encerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900">Histórico de Atividades</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Veja o histórico de atividades da sua conta.
                </p>
                
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ver Histórico de Atividades
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Database Settings */}
      {activeTab === 'database' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Configurações do Banco de Dados</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900">Informações do Banco de Dados</h3>
              <div className="mt-2 bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo de Banco de Dados</p>
                    <p className="text-sm text-gray-900">PostgreSQL</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Versão</p>
                    <p className="text-sm text-gray-900">14.5</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tamanho</p>
                    <p className="text-sm text-gray-900">256 MB</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Última Atualização</p>
                    <p className="text-sm text-gray-900">15/05/2025 10:30</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900">Backup</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Configure backups automáticos do banco de dados.
                </p>
                
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <input
                      id="backup-daily"
                      name="backup-frequency"
                      type="radio"
                      defaultChecked
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="backup-daily" className="ml-3 block text-sm font-medium text-gray-700">
                      Diário
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="backup-weekly"
                      name="backup-frequency"
                      type="radio"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="backup-weekly" className="ml-3 block text-sm font-medium text-gray-700">
                      Semanal
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="backup-monthly"
                      name="backup-frequency"
                      type="radio"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="backup-monthly" className="ml-3 block text-sm font-medium text-gray-700">
                      Mensal
                    </label>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Salvar Configurações
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Fazer Backup Agora
                  </button>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900">Restauração</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Restaure o banco de dados a partir de um backup anterior.
                </p>
                
                <div className="mt-4">
                  <select
                    id="backup-restore"
                    name="backup-restore"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option>Backup - 15/05/2025 00:00</option>
                    <option>Backup - 14/05/2025 00:00</option>
                    <option>Backup - 13/05/2025 00:00</option>
                    <option>Backup - 12/05/2025 00:00</option>
                    <option>Backup - 11/05/2025 00:00</option>
                  </select>
                  
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Restaurar Backup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Configurações de Notificações</h2>
          <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
            <div>
              <div className="flex items-center">
                <input
                  id="emailNotifications"
                  {...notificationForm.register('emailNotifications')}
                  type="checkbox"
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-3 block text-sm font-medium text-gray-700">
                  Habilitar notificações por email
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Receba notificações por email sobre atividades importantes do sistema.
              </p>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900">Tipos de Notificações</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="newBidding"
                    {...notificationForm.register('newBidding')}
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="newBidding" className="ml-3 block text-sm font-medium text-gray-700">
                    Novas licitações
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="biddingUpdates"
                    {...notificationForm.register('biddingUpdates')}
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="biddingUpdates" className="ml-3 block text-sm font-medium text-gray-700">
                    Atualizações de licitações
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="newPenalty"
                    {...notificationForm.register('newPenalty')}
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="newPenalty" className="ml-3 block text-sm font-medium text-gray-700">
                    Novas penalidades
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="contractExpiration"
                    {...notificationForm.register('contractExpiration')}
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="contractExpiration" className="ml-3 block text-sm font-medium text-gray-700">
                    Expiração de contratos
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="systemUpdates"
                    {...notificationForm.register('systemUpdates')}
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="systemUpdates" className="ml-3 block text-sm font-medium text-gray-700">
                    Atualizações do sistema
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;