import productModal from './productModal.js';

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

// 讀取外部的資源
loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

// Activate the locale
configure({
  generateMessage: localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'yiijiee118';

const app = Vue.createApp({
  data() {
    return {
      loadingStatus: {
        loadingItem: '',
      },
      products: [],
      product: {},
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
      cart: {},
    };
  },
  methods: {
    getProducts() {
      const url = `${apiUrl}/api/${apiPath}/products`;
      axios.get(url)
      .then((response) => {
        // console.log('產品列表：' , response.data.products);
        this.products = response.data.products;
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
    },
    getProduct(id) {
      const url = `${apiUrl}/api/${apiPath}/product/${id}`;
      this.loadingStatus.loadingItem = id;
      axios.get(url)
      .then((response) => {
        this.loadingStatus.loadingItem = '';
        this.product = response.data.product;
        this.$refs.productModalRef.openModal();
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
    },
    addToCart(id, qty = 1) {
      const url = `${apiUrl}/api/${apiPath}/cart`;
      this.loadingStatus.loadingItem = id;
      const cart = {
        product_id: id,
        qty,
      };
      this.$refs.productModalRef.hideModal();
      axios.post(url, { data: cart })
      .then((response) => {
        alert(response.data.message);
        this.loadingStatus.loadingItem = '';
        this.getCart();
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
    },
    updateCart(data) {
      if (!Number.isInteger(data.qty)) {
        data.qty = Math.floor(data.qty);
      }
      if (data.qty <= 0) {
        this.removeCartItem(data.id);
        return;
      }
      this.loadingStatus.loadingItem = data.id;
      const url = `${apiUrl}/api/${apiPath}/cart/${data.id}`;
      const cart = {
        product_id: data.product_id,
        qty: data.qty,
      };
      axios.put(url, { data: cart })
      .then((response) => {
        alert(response.data.message);
        this.loadingStatus.loadingItem = '';
        this.getCart();
      })
      .catch((err) => {
        alert(err.response.data.message);
        this.loadingStatus.loadingItem = '';
      });
    },
    deleteAllCarts() {
      const url = `${apiUrl}/api/${apiPath}/carts`;
      axios.delete(url)
      .then((response) => {
        alert(response.data.message);
        this.getCart();
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
    },
    getCart() {
      const url = `${apiUrl}/api/${apiPath}/cart`;
      axios.get(url)
      .then((response) => {
        this.cart = response.data.data;
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
    },
    removeCartItem(id) {
      const url = `${apiUrl}/api/${apiPath}/cart/${id}`;
      this.loadingStatus.loadingItem = id;
      axios.delete(url)
      .then((response) => {
        alert(response.data.message);
        this.loadingStatus.loadingItem = '';
        this.getCart();
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
    },
    createOrder() {
      const url = `${apiUrl}/api/${apiPath}/order`;
      const order = this.form;
      axios.post(url, { data: order })
      .then((response) => {
        alert(response.data.message);

        // 將表單資料清空
        this.$refs.form.resetForm();
        this.getCart();
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
    },
  },
  mounted() {
    this.getProducts();
    this.getCart();
  },
});
// VeeValidation全域元件
app.component('VForm', Form);
app.component('VField', Field);
app.component('ErrorMessage', ErrorMessage);

app.component('productModal', productModal);
app.mount('#app');