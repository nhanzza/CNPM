from flask import Flask, render_template_string, request

app = Flask(__name__)

# Danh sách sản phẩm mẫu
products = [
    {"id": 1, "name": "Áo thun", "price": 150000},
    {"id": 2, "name": "Quần jean", "price": 300000},
    {"id": 3, "name": "Giày thể thao", "price": 500000},
]

cart = []

@app.route("/")
def home():
    html = """
    <h1>Cửa hàng demo</h1>
    <ul>
    {% for p in products %}
        <li>{{p.name}} - {{p.price}} VNĐ 
            <a href="/add/{{p.id}}">Thêm vào giỏ</a>
        </li>
    {% endfor %}
    </ul>
    <h2>Giỏ hàng</h2>
    <ul>
    {% for item in cart %}
        <li>{{item.name}} - {{item.price}} VNĐ</li>
    {% endfor %}
    </ul>
    """
    return render_template_string(html, products=products, cart=cart)

@app.route("/add/<int:product_id>")
def add_to_cart(product_id):
    product = next((p for p in products if p["id"] == product_id), None)
    if product:
        cart.append(product)
    return home()

if __name__ == "__main__":
    app.run(debug=True)



