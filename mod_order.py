with open('models/Order.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("billUrl: { type: String, default: '' }", "billUrl: { type: String, default: '' },\n    estimatedDeliveryTime: { type: Number, default: null }")

with open('models/Order.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated Order.js!")
