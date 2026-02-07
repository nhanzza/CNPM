'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/services/api.service'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'
import { Button } from '@/components/ui/Button'
import { Sunrise, Sun, Moon, Clock } from 'lucide-react'

interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  role: 'cashier' | 'warehouse_staff' | 'manager' | 'owner'
  status: 'active' | 'inactive'
  created_at: string
  address?: string
  citizen_id?: string
  salary?: number
  start_date?: string
  shift?: 'morning' | 'afternoon' | 'evening' | 'fulltime'
}

interface EmployeeForm {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: 'cashier' | 'warehouse_staff' | 'manager' | 'owner'
  address: string
  citizen_id: string
  salary: string
  start_date: string
  shift: 'morning' | 'afternoon' | 'evening' | 'fulltime'
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<EmployeeForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'cashier',
    address: '',
    citizen_id: '',
    salary: '',
    start_date: new Date().toISOString().split('T')[0],
    shift: 'fulltime'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [settings] = useState(settingsService.getSettings())
  const t = (vi: string, en: string) => (settings.language === 'en' ? en : vi)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id
      if (!storeId) {
        setEmployees([])
        return
      }

      const res = await apiClient.get('/users', { params: { store_id: storeId } })
      const data = res.data?.users || res.data || []
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch employees', error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async () => {
    if (!formData.name || !formData.email) {
      alert(t('Vui lòng điền đầy đủ thông tin bắt buộc (*)', 'Please fill in all required fields (*)'))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      alert(t('Mật khẩu không khớp', 'Passwords do not match'))
      return
    }

    if (formData.password.length < 6) {
      alert(t('Mật khẩu phải có ít nhất 6 ký tự', 'Password must be at least 6 characters'))
      return
    }

    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id
      if (!storeId) {
        alert(t('Không tìm thấy cửa hàng. Vui lòng đăng nhập lại.', 'Store not found. Please log in again.'))
        return
      }

      const res = await apiClient.post('/users', {
        store_id: storeId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        status: 'active',
        address: formData.address,
        citizen_id: formData.citizen_id,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        start_date: formData.start_date,
        shift: formData.shift
      })

      const created = res.data?.employee
      if (created) {
        setEmployees(prev => [...prev, created])
      } else {
        await fetchEmployees()
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'cashier',
        address: '',
        citizen_id: '',
        salary: '',
        start_date: new Date().toISOString().split('T')[0],
        shift: 'fulltime'
      })
      setShowAddForm(false)
      alert(t('Tạo nhân viên thành công!', 'Employee created successfully!'))
    } catch (error) {
      console.error('Failed to create employee', error)
      alert(t('Không thể tạo nhân viên. Vui lòng thử lại.', 'Failed to create employee. Please try again.'))
    }
  }

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return

    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id
      if (!storeId) {
        alert(t('Không tìm thấy cửa hàng. Vui lòng đăng nhập lại.', 'Store not found. Please log in again.'))
        return
      }

      const res = await apiClient.put(`/users/${selectedEmployee.id}`, {
        store_id: storeId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: selectedEmployee.status,
        address: formData.address,
        citizen_id: formData.citizen_id,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        start_date: formData.start_date,
        shift: formData.shift
      })

      const updated = res.data?.employee
      if (updated) {
        setEmployees(prev => prev.map(emp =>
          emp.id === selectedEmployee.id ? updated : emp
        ))
      } else {
        await fetchEmployees()
      }

      setShowEditForm(false)
      setSelectedEmployee(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'cashier',
        address: '',
        citizen_id: '',
        salary: '',
        start_date: new Date().toISOString().split('T')[0],
        shift: 'fulltime'
      })
      alert(t('Cập nhật nhân viên thành công!', 'Employee updated successfully!'))
    } catch (error) {
      console.error('Failed to update employee', error)
      alert(t('Không thể cập nhật nhân viên. Vui lòng thử lại.', 'Failed to update employee. Please try again.'))
    }
  }

  const handleResetPassword = async (employeeId: string, employeeName: string) => {
    const newPassword = prompt(t(`Nhập mật khẩu mới cho ${employeeName}:`, `Enter new password for ${employeeName}:`))
    if (!newPassword) return

    if (newPassword.length < 6) {
      alert(t('Mật khẩu phải có ít nhất 6 ký tự', 'Password must be at least 6 characters'))
      return
    }

    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id
      if (!storeId) {
        alert(t('Không tìm thấy cửa hàng. Vui lòng đăng nhập lại.', 'Store not found. Please log in again.'))
        return
      }

      await apiClient.put(`/users/${employeeId}/password`, {
        store_id: storeId,
        new_password: newPassword
      })

      alert(t(`Đặt lại mật khẩu thành công cho ${employeeName}!\n\nMật khẩu mới: ${newPassword}`, `Password reset successfully for ${employeeName}!\n\nNew password: ${newPassword}`))
    } catch (error) {
      console.error('Failed to reset password', error)
      alert(t('Không thể đặt lại mật khẩu. Vui lòng thử lại.', 'Failed to reset password. Please try again.'))
    }
  }

  const handleToggleStatus = async (employee: Employee) => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active'

    if (!confirm(t(
      `Bạn chắc chắn muốn ${newStatus === 'active' ? 'kích hoạt lại' : 'cho nghỉ việc'} nhân viên ${employee.name}?`,
      `Are you sure you want to ${newStatus === 'active' ? 'reactivate' : 'deactivate'} employee ${employee.name}?`
    ))) {
      return
    }

    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id
      if (!storeId) {
        alert(t('Không tìm thấy cửa hàng. Vui lòng đăng nhập lại.', 'Store not found. Please log in again.'))
        return
      }

      const res = await apiClient.put(`/users/${employee.id}`, {
        store_id: storeId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        status: newStatus
      })

      const updated = res.data?.employee
      if (updated) {
        setEmployees(prev => prev.map(emp =>
          emp.id === employee.id ? updated : emp
        ))
      } else {
        await fetchEmployees()
      }

      alert(t(
        `${newStatus === 'active' ? 'Kích hoạt' : 'Cho nghỉ việc'} thành công!`,
        `${newStatus === 'active' ? 'Reactivation' : 'Deactivation'} successful!`
      ))
    } catch (error) {
      console.error('Failed to update status', error)
      alert(t('Không thể cập nhật trạng thái. Vui lòng thử lại.', 'Failed to update status. Please try again.'))
    }
  }

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(t(
      `⚠️ BẠN CHẮC CHẮN MUỐN XÓA NHÂN VIÊN ${employeeName}?\n\nHành động này không thể hoàn tác!`,
      `⚠️ ARE YOU SURE YOU WANT TO DELETE EMPLOYEE ${employeeName}?\n\nThis action cannot be undone!`
    ))) {
      return
    }

    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id
      if (!storeId) {
        alert(t('Không tìm thấy cửa hàng. Vui lòng đăng nhập lại.', 'Store not found. Please log in again.'))
        return
      }

      await apiClient.delete(`/users/${employeeId}`, {
        params: { store_id: storeId }
      })

      setEmployees(prev => prev.filter(emp => emp.id !== employeeId))
      alert(t('Xóa nhân viên thành công!', 'Employee deleted successfully!'))
    } catch (error) {
      console.error('Failed to delete employee', error)
      alert(t('Không thể xóa nhân viên. Vui lòng thử lại.', 'Failed to delete employee. Please try again.'))
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('Quản Lý Nhân Viên', 'Employee Management')}</h1>
        <Button
          onClick={() => {
            setShowAddForm(true)
            setShowEditForm(false)
          }}
          size="md"
          className="rounded-full px-6 py-2.5"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">+</span>
            <span>{t('Thêm Nhân Viên', 'Add Employee')}</span>
          </span>
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input
          type="text"
          placeholder={t('Tìm kiếm theo tên hoặc email...', 'Search by name or email...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base"
        />
      </div>

      {/* Add Form */}
      {showAddForm && !showEditForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">{t('Thêm Nhân Viên Mới', 'Add New Employee')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Tên Nhân Viên *', 'Employee Name *')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('Nhập tên...', 'Enter name...')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Số Điện Thoại', 'Phone Number')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Số CCCD/CMND', 'Citizen ID')}</label>
              <input
                type="text"
                value={formData.citizen_id}
                onChange={(e) => setFormData({ ...formData, citizen_id: e.target.value })}
                placeholder="079123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Địa Chỉ', 'Address')}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={t('Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP', 'Street, Ward, District, City')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Chức Vụ *', 'Role *')}</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              >
                <option value="cashier">{t('Thu Ngân', 'Cashier')}</option>
                <option value="warehouse_staff">{t('Nhân Viên Kho', 'Warehouse Staff')}</option>
                <option value="manager">{t('Quản Lý', 'Manager')}</option>
                <option value="owner">{t('Chủ Cửa Hàng', 'Store Owner')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Ca Làm Việc', 'Work Shift')}</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              >
                <option value="morning">{t('Sáng (7h-12h)', 'Morning (7AM-12PM)')}</option>
                <option value="afternoon">{t('Chiều (12h-17h)', 'Afternoon (12PM-5PM)')}</option>
                <option value="evening">{t('Tối (17h-22h)', 'Evening (5PM-10PM)')}</option>
                <option value="fulltime">{t('Toàn thời gian', 'Full-time')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Lương (₫/tháng)', 'Salary (/month)')}</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="5000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Ngày Vào Làm', 'Start Date')}</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Mật Khẩu *', 'Password *')}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('Nhập mật khẩu (tối thiểu 6 ký tự)...', 'Enter password (min 6 characters)...')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Xác Nhận Mật Khẩu *', 'Confirm Password *')}</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder={t('Xác nhận mật khẩu...', 'Confirm password...')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddEmployee}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              {t('Tạo', 'Create')}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
            >
              {t('Hủy', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {showEditForm && selectedEmployee && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">{t('Chỉnh Sửa Nhân Viên', 'Edit Employee')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Tên Nhân Viên', 'Employee Name')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Số Điện Thoại', 'Phone Number')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Số CCCD/CMND', 'Citizen ID')}</label>
              <input
                type="text"
                value={formData.citizen_id}
                onChange={(e) => setFormData({ ...formData, citizen_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Địa Chỉ', 'Address')}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Chức Vụ', 'Role')}</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              >
                <option value="cashier">{t('Thu Ngân', 'Cashier')}</option>
                <option value="warehouse_staff">{t('Nhân Viên Kho', 'Warehouse Staff')}</option>
                <option value="manager">{t('Quản Lý', 'Manager')}</option>
                <option value="owner">{t('Chủ Cửa Hàng', 'Store Owner')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Ca Làm Việc', 'Work Shift')}</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              >
                <option value="morning">{t('Sáng (7h-12h)', 'Morning (7AM-12PM)')}</option>
                <option value="afternoon">{t('Chiều (12h-17h)', 'Afternoon (12PM-5PM)')}</option>
                <option value="evening">{t('Tối (17h-22h)', 'Evening (5PM-10PM)')}</option>
                <option value="fulltime">{t('Toàn thời gian', 'Full-time')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Lương (₫/tháng)', 'Salary (/month)')}</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Ngày Vào Làm', 'Start Date')}</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleEditEmployee}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {t('Cập Nhật', 'Update')}
            </button>
            <button
              onClick={() => {
                setShowEditForm(false)
                setSelectedEmployee(null)
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
            >
              {t('Hủy', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Employees Table */}
      {loading ? (
        <div className="text-center py-8">{t('Đang tải dữ liệu...', 'Loading data...')}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredEmployees.length === 0 ? (
            <div className="p-6 text-center text-gray-500">{t('Chưa có nhân viên nào', 'No employees yet')}</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Tên', 'Name')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Chức Vụ', 'Role')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('SĐT', 'Phone')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Ca Làm Việc', 'Shift')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Lương', 'Salary')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Ngày Vào', 'Start Date')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Trạng Thái', 'Status')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Thao Tác', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{employee.name}</div>
                      <div className="text-xs text-gray-500">{employee.email}</div>
                      {employee.citizen_id && (
                        <div className="text-xs text-gray-400">CCCD: {employee.citizen_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${employee.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                          employee.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                            employee.role === 'cashier' ? 'bg-green-100 text-green-800' :
                              'bg-orange-100 text-orange-800'
                        }`}>
                        {employee.role === 'owner' ? t('Chủ CH', 'Owner') :
                          employee.role === 'manager' ? t('Quản Lý', 'Manager') :
                            employee.role === 'cashier' ? t('Thu Ngân', 'Cashier') :
                              t('NV Kho', 'Warehouse')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{employee.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 inline-flex items-center gap-1">
                        {employee.shift === 'morning' && <><Sunrise className="w-3 h-3" /> {t('Sáng', 'Morning')}</>}
                        {employee.shift === 'afternoon' && <><Sun className="w-3 h-3" /> {t('Chiều', 'Afternoon')}</>}
                        {employee.shift === 'evening' && <><Moon className="w-3 h-3" /> {t('Tối', 'Evening')}</>}
                        {(!employee.shift || employee.shift === 'fulltime') && <><Clock className="w-3 h-3" /> {t('Full', 'Full')}</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {employee.salary ? settingsService.formatCurrency(employee.salary) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {employee.start_date ? settingsService.formatDate(employee.start_date) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${employee.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {employee.status === 'active' ? t('✓ Đang Làm', '✓ Active') : t('✕ Đã Nghỉ', '✕ Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setFormData({
                              name: employee.name,
                              email: employee.email,
                              phone: employee.phone || '',
                              password: '',
                              confirmPassword: '',
                              role: employee.role,
                              address: employee.address || '',
                              citizen_id: employee.citizen_id || '',
                              salary: employee.salary?.toString() || '',
                              start_date: employee.start_date || new Date().toISOString().split('T')[0],
                              shift: employee.shift || 'fulltime'
                            })
                            setShowEditForm(true)
                            setShowAddForm(false)
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          {t('Sửa', 'Edit')}
                        </button>
                        <button
                          onClick={() => handleResetPassword(employee.id, employee.name)}
                          className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                        >
                          {t('Đặt Lại MK', 'Reset PW')}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(employee)}
                          className={`px-2 py-1 rounded text-xs text-white ${employee.status === 'active'
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-green-500 hover:bg-green-600'
                            }`}
                        >
                          {employee.status === 'active' ? t('Cho Nghỉ', 'Deactivate') : t('Kích Hoạt', 'Activate')}
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          {t('Xóa', 'Delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
