<template xmlns:v-bind="">
  <v-form v-model="valid" ref="form" lazy-validation>
    <h2>請輸入帳號以及密碼登入</h2>
    <p>登入展示的帳號: supplier<br />密碼: 1234</p>
    <p>登入後請先點選"展示說明"選單</p>
    <v-text-field
      name="account"
      label="帳號"
      v-model="account"
      :rules="accountRules"
      required
    ></v-text-field>
    <!--
    <v-select
      v-bind:items="items"
      v-model="select"
      label="選擇帳號"
      single-line
      item-text="Name"
      item-value="Account"
      @input="selected"
    ></v-select>
    -->
    <v-text-field
      name="password"
      label="密碼"
      v-model="password"
      :rules="passwordRules"
      :append-icon="e1 ? 'visibility' : 'visibility_off'"
      :append-icon-cb="() => (e1 = !e1)"
      :type="e1 ? 'password' : 'text'"
      required
    ></v-text-field>
    <v-btn
      @click="submit"
      :disabled="!valid"
    >
      登入
    </v-btn>
    <v-btn @click="clear">清除</v-btn>
  </v-form>
</template>

<script>
  import { mapGetters } from 'vuex'
  import eventBus from '@/libs/event'
  import service from '@/libs/service'

  export default {
    name: 'Login',
    metaInfo: {
      title: '登入'
    },
    async created () {
      try {
        let result = await service.Get('account/List')
        if (result.status === 200 && result.data) {
          this.items = result.data
        }
      } catch (e) {
      }
    },
    data () {
      return {
        e1: true,
        account: '',
        password: '',
        valid: true,
        accountRules: [ (v) => !!v || '請輸入帳號' ],
        passwordRules: [ (v) => !!v || '請輸入密碼' ],
        select: '',
        items: []
      }
    },
    computed: {
      ...mapGetters([
        'authorized',
        'userId',
        'userAccount',
        'userName',
        'userRole'
      ])
    },
    methods: {
      selected () {
        this.account = this.select
      },
      async submit () {
        if (!this.$refs.form.validate()) return
        let result = await service.Login(this.account, this.password)
        if (!result) {
          eventBus.$emit('snackbar', {
            message: '登入失敗, 請再試一次.',
            color: 'error',
            show: true
          })
          return
        }
        this.$router.push('/')
      },
      clear () {
        this.$refs.form.reset()
      }
    }
  }
</script>

<style scoped>

</style>
