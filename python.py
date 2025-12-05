# Demo project for GitHub
# Author: Your Name

def tinh_tong(a, b):
    return a + b

def tinh_hieu(a, b):
    return a - b

def menu():
    print("=== Máy tính mini ===")
    print("1. Tính tổng")
    print("2. Tính hiệu")
    print("0. Thoát")

while True:
    menu()
    choice = input("Chọn chức năng: ")

    if choice == "1":
        x = float(input("Nhập số thứ 1: "))
        y = float(input("Nhập số thứ 2: "))
        print("Kết quả:", tinh_tong(x, y))
    elif choice == "2":
        x = float(input("Nhập số thứ 1: "))
        y = float(input("Nhập số thứ 2: "))
        print("Kết quả:", tinh_hieu(x, y))
    elif choice == "0":
        print("Tạm biệt!")
        break
    else:
        print("Lựa chọn không hợp lệ, thử lại nhé!")

