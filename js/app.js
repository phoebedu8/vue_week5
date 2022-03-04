// 宣告所有會用到的 Vee Validate 的工具
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n; // I18n 是多國語系

// 定義規則
defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

// 中文的驗證資訊 json 檔案
loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

configure({ // 用來做一些設定
    generateMessage: localize('zh_TW'), //啟用 locale 
});

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'xqrass-hexschool';

Vue.createApp({
    data() {
        return {
            cartData: {}, // 購物車列表
            products: [], // 產品列表
            productId: '',
            isLoadingItem: '', // 製作局部讀取效果 
            form: {
                user: {
                  name: '',
                  email: '',
                  tel: '',
                  address: '',
                },
                message: '',
            },
        };
    },
    components: { // 區域註冊的元件
        VForm: Form,
        VField: Field,
        ErrorMessage: ErrorMessage,
      },
    methods: {
        // 取得所有產品列表
        getProducts() {
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
            .then((res) => {
                //console.log(res);
                this.products = res.data.products;
            });
        },
        // 打開產品視窗(查看更多按鈕)
        openProductModal(id) {
            this.productId = id;
            this.$refs.productModal.openModal();
        },
        // 取得購物車列表
        getCart() {
            axios.get(`${apiUrl}/api/${apiPath}/cart`)
            .then((res) => {
                //console.log(res);
                this.cartData = res.data.data;
            });
        },
        // 新增購物車按鈕事件
        addToCart(id, qty = 1) { // 加入購物車必須帶入兩個參數
            const data = {
                product_id: id,
                qty,
            };
            this.isLoadingItem = id;
            axios.post(`${apiUrl}/api/${apiPath}/cart`, { data })
            .then((res) => {
                console.log(res);
                this.getCart(); // 重新取得購物車內容
                this.$refs.productModal.closeModal(); // 加入購物車完，關閉Model元件
                this.isLoadingItem = ''; // 讀完之後會清空
            });
        },
        // 刪除購物車特定品項
        removeCartItem(id) {
            this.isLoadingItem = id;
            axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
            .then((res) => {
                console.log(res);
                this.getCart(); // 重新取得購物車內容
                this.isLoadingItem = ''; // 讀完之後會清空
            });
        },
        // 更新購物車品項數量
        updateCartItem(item) {
            const data = {
                product_id: item.id,
                qty: item.qty,
            };
            this.isLoadingItem = item.id;
            axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data })
            .then((res) => {
                console.log(res);
                this.getCart(); // 重新取得購物車內容
                this.isLoadingItem = ''; // 讀完之後會清空
            });
        },
        // 清空購物車
        deleteAllCarts() {
            const url = `${apiUrl}/api/${apiPath}/carts`;
            axios.delete(url)
            .then((res) => {
              alert(res.data.message);
              this.getCart();
            }).catch((err) => {
              alert(err.data.message);
            });
        },
        // 送出訂單
        createOrder() {
            const url = `${apiUrl}/api/${apiPath}/order`;
            const order = this.form;
            axios.post(url, { data: order })
            .then((res) => {
            alert(res.data.message);
            this.$refs.form.resetForm(); // 清空欄位
            this.getCart();
            }).catch((err) => {
            alert(err.data.message);
            });
        },
    },
    mounted() {
        this.getProducts();
        this.getCart();
    },
})

// 註冊 modal 元件
// $refs
.component('product-modal', {
    props: ['id'], // 接收
    template: '#userProductModal',
    data() {
        return {
            modal: {},
            product: {},
            qty: 1, // 在加入購物車，至少要有一個
        };
    },
    watch: {
        id() {
            this.getProduct(); // id 有變動時去觸發 getProduct
        },
    },
    methods: { // 開啟或關閉 modal 使用的
        openModal() {
            this.modal.show();
        },
        closeModal() {
            this.modal.hide();
        },
        getProduct() {  // 取得單一品項
            axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
            .then((res) => {
                this.product = res.data.product;
            })
        },
        addToCart() { //  查看更多加入數量到購物車
            this.$emit('add-cart', this.product.id, this.qty);
        },
    },
    mounted() { // 初始化的方式
        // ref="modal"
        this.modal = new bootstrap.Modal(this.$refs.modal);
    },
})

// 根實體，並掛載於 #app
.mount('#app');