<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i>TASK管理</el-breadcrumb-item>
                <el-breadcrumb-item>TASK列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-table :data="task_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column type="index" label="ID" width="60"></el-table-column>
            <!--
            <el-table-column prop="stock_name" label="股票名称" width="100"></el-table-column>
            <el-table-column prop="obj_amount" label="操作量" width="80"></el-table-column>
            -->
            <el-table-column prop="task_type" label="任务类型" width="100"></el-table-column>
            <el-table-column prop="trade_ktype" label="K线类型" width="100"></el-table-column>
            <el-table-column prop="market_gateway" label="行情接口" width="180"></el-table-column>
            <el-table-column prop="strategy_name" label="策略标的" width="180"></el-table-column>
            <el-table-column prop="trade_symbol" label="交易标的" width="95"></el-table-column>
            <el-table-column prop="task_status" label="运行状态" width="95"></el-table-column>
            <el-table-column prop="price" label="最新价" width="80"></el-table-column>
            <el-table-column label="操作" width="120">
                <template slot-scope="scope">
                    <el-button class="btn1" type="text" size="small" @click="delTask(scope.row.task_id)">删除</el-button>
                    <el-button class="btn1" type="danger" size="small" v-if="scope.row.task_status =='running'" @click="stopTask(scope.row.task_id)">停止</el-button>
                    <el-button class="btn1" type="success" size="small" v-else @click="startTask(scope.row.task_id)">启动</el-button>
                    <el-button class="btn1" type="text" size="small" @click="page_forward(scope.row.task_id)">查看结果</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                    @current-change ="handleCurrentChange"
                    :current-page="currentPage"
                    layout="prev, pager, next"
                    :total="pageTotal">
            </el-pagination>
        </div>
    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    export default {
        data: function(){
            return {
                dialogFormVisible:false,
                dialogMarketVisible:false,
                dialogCheckVisible:false,
                radio3:'全部',

                tiemout:'',

                form: {
                    task_id:'',
                    task_status:'',
                    obj_amount:'',
                    trade_symbol:'111',
                    trade_ktype:'1',
                    stock_name:'www',
                    strategy_main:'主策略',
                    strategy_type:'1',
                    strategy_list:[{
                        stock_symbol:'',
                        stock_name:'',
                        stock_ktype:'',
                        trade_amount:'',
                        strategy_name:'',
                    }],
                    riskctrl_name: '',
                    order_gateway: '',
                    market_gateway: '',
                    bind_market_gateway: ''
                },

                rules: {
                    riskctrl_name:[
                        {required: true, message: '请输入风控名称', trigger: 'blur'},
                    ],
                    order_gateway:[
                        {required: true, message: '请输入交易接口', trigger: 'blur'}
                    ],
                },
                log:{
                    message:''
                },

                formLabelWidth: '100px',
                formLabelWidth50: '50px',
                fileList3: [],
                loading:false,
                fullscreenLoading: false,
                task_list:[],
                strategy_file_list:[],
                riskctrl_file_list:[],
                order_gateway_file_list:[],
                market_gateway_file_list:[],
                valid_stock_list:[],

                pageTotal:0,
                currentPage:1
            }
        },
        created: function(){
            if ( this.tiemout ) {
                clearTimeout(this.tiemout);
                this.tiemout = '';
            }

            this.getTaskList();
            //this.getTaskPrice();
            this.getStrategyList();
            this.getRiskCtrlList();
            this.getOrderGatewayList();
            this.getMarketGatewayList();
            this.getBindMarket();

            //this.getValidStockList();
        },
        beforeDestroy: function(){
            if ( this.tiemout ) {
                clearTimeout(this.tiemout);
                this.tiemout = '';
            }

            console.log('destory');
        },
        methods: {
            getTaskList: function(){//获取task列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/task/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.pageTotal = res.data.extra.length;
                        self.task_list = res.data.extra.slice(0,10);
                    }
                    else{
                        self.task_list = [];
                    }
                })
            },
            getTaskPrice: function(){//获取task列表
                var self = this;
                var stock_list = []
                for (var i = 0; i < self.task_list.length; i++) {
                    if (self.task_list[i].task_status == 'running'){
                        stock_list.push({task_id:self.task_list[i].task_id, trade_symbol:self.task_list[i].trade_symbol})
                    }
                }

                self.loading = false;
                self.$axios.post('/api/stock/price', stock_list).then(function(res){
                    if(res.data.ret_code == 0){
                        //self.task_list = res.data.extra.slice(0,10);
                        for (var i = 0; i < res.data.extra.length; i++) {
                            var item = res.data.extra[i];
                            for (var j = 0; j < self.task_list.length; j++) {
                                if (item['trade_symbol'] == self.task_list[j]['trade_symbol']){
                                    self.task_list[j]['price'] = item['price']
                                    self.task_list[j]['volume'] = item['volume']
                                }
                            }
                        }
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
                console.log(this.$route.path )
                if ( this.$route.path == '/task/manage' ) {
                    this.tiemout = setTimeout(() => {
                        //this.getTaskPrice();
                    }, 5000);
                }

            },
            getStrategyList: function(){//获取rom列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/strategy/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.strategy_file_list = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            getRiskCtrlList: function(){//获取设备类型
                var self = this;
                self.loading = true;
                self.$axios.post('/api/riskctrl/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.riskctrl_file_list = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            getOrderGatewayList: function(){//获取设备类型
                var self = this;
                self.loading = true;
                self.$axios.post('/api/order/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.order_gateway_file_list = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            getMarketGatewayList: function(){//获取设备类型
                var self = this;
                self.loading = true;
                self.$axios.post('/api/market/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.market_gateway_file_list = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            getValidStockList: function(){//获取设备类型
                var self = this;
                self.loading = false;
                self.$axios.post('/api/stock/list').then(function(res){
                    //self.loading = false;
                    if(res.data.ret_code == 0){
                        self.valid_stock_list = res.data.extra;
                    }
                })
            },
            getStockName: function(){//获取设备类型
                var self = this;
                if (self.form.trade_symbol.length < 6){
                    self.form.stock_name = '';
                    return;
                }

                var params = {trade_symbol:self.form.trade_symbol}
                self.loading = false;
                self.$axios.post('/api/stock/name', params).then(function(res){
                    //self.loading = false;
                    if(res.data.ret_code == 0){
                        self.form.stock_name = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            getBindMarket: function(){//获取绑定的行情
                var self = this;
                self.$axios.post('/api/market/get/bindobj').then(function(res){
                    if(res.data.ret_code == 0){
                        self.form.bind_market_gateway = res.data.extra;
                        self.form.market_gateway = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            beforeUpload: function(file){
                console.log(file);
                this.form.file_name = file.name;
                return true;
            },
            handleSuccess: function(response,file,fileList){
                console.log(response);
                this.fullscreenLoading  = false;
                this.$message('创建成功');
                this.dialogFormVisible = false;
                this.getTaskList();
            },
            handleError: function(response,file,fileList){
                this.$message('操作失败');
                self.fullscreenLoading  = false;
            },
            page_forward (task_id){
                this.$router.push({name: 'PickstockResult', params :{task_id: task_id}});
            },
            bindMarket: function(file_name) {
                var self = this;
                var params = {
                    file_name:file_name,
                    is_bind:'true',
                };
                self.$axios.post('/api/market/bind', params).then(function(res){
                    console.log(res);
                    if(res.data.ret_code == 0){
                        self.$message('绑定成功');
                        self.dialogMarketVisible = false;
                        self.form.bind_market_gateway = self.form.market_gateway;
                    }
                    else{
                        self.$message('绑定失败:' + res.data.extra);
                    }
                });
            },

            saveAdd: function(formName){
                var self = this;

                var params = {
                    //trade_symbol:self.form.trade_symbol,
                    //stock_name:self.form.stock_name,
                    //obj_amount:self.form.obj_amount,
                    strategy_type:self.form.strategy_type,
                    strategy_list:self.form.strategy_list,
                    riskctrl_name:self.form.riskctrl_name,
                    order_gateway:self.form.order_gateway,
                    market_gateway:self.form.market_gateway
                };

                self.loading = true;
                self.$axios.post('/api/task/add', params).then(function(res){
                    self.loading = false;
                    console.log(res);
                    if(res.data.ret_code == 0){
                        self.$message('添加成功');
                        self.getTaskList();
                    }
                    else{
                        self.$message('添加失败:' + res.data.extra);
                    }

                },function(err){
                    self.$message('添加失败');
                    self.loading = false;
                    console.log(err);
                })

            },
            delTask: function(task_id){//删除
                var self = this;
                var params = {
                    task_id: task_id
                };
                self.loading = true;
                self.$axios.post('/api/task/del', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('删除成功');
                        self.getTaskList();
                    }
                    else {
                        self.$message(res.data.extra);
                    }

                },function(err){
                    self.$message('删除失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            startTask: function(task_id){//上架操作
                var self = this;
                var params = {
                    task_id: task_id,
                };
                self.loading = true;
                self.$axios.post('/api/task/start',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('操作成功');
                        self.getTaskList();
                    }
                    else {
                        self.$message(res.data.extra);
                    }

                },function(err){
                    self.$message('操作失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            stopTask: function(task_id){//下架操作
                var self = this;
                var params = {
                    task_id: task_id,
                };
                self.loading = true;
                self.$axios.post('/api/task/stop', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('操作成功');
                        self.getTaskList();
                    }
                    else {
                        self.$message(res.data.extra);
                    }

                },function(err){
                    self.$message('操作失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            handleCurrentChange:function(val){
                this.cur_page = val;
                this.getTaskList();
            },
            changeStockSymbol:function(index) {

                var stock_symbol = this.form.strategy_list[index].stock_symbol;

                //所有行的stock_symbol 一致
                if (this.form.strategy_type == 2) {
                    //var value = this.form.strategy_list[index].stock_symbol;
                    for(var i = 0; i<this.form.strategy_list.length; i++){
                        this.form.strategy_list[i].stock_symbol = stock_symbol;
                    }
                }


                //获取stock_symbol  对应的名称
                if (stock_symbol.length != 6){
                    this.form.strategy_list[index].stock_name = '';
                    return;
                }
                var self = this;
                var params = '';
                if (stock_symbol[0] == '6') {
                    params = '/sina/list=' + 'sh' + stock_symbol;
                }else{
                    params = '/sina/list=' + 'sz' + stock_symbol;
                }
                self.$axios.get(params).then(function(res){
                    var data_substr = res.data.match(/\"(\S*)(?=\")/);
                    if (data_substr == null) {
                        return;
                    }
                    var fields = data_substr[1].split(",");
                    self.form.strategy_list[index].stock_name = fields[0];

                },function(err){
                    self.form.strategy_list[index].stock_name = '';
                    console.log(err);
                })


            },
            changeStrategyItem: function(index) {
                //只保留一行
                var list0 = this.form.strategy_list[0];
                if (this.form.strategy_type == 1) {
                    this.form.strategy_list = [list0];
                }
            },
            removeStrategyItem(index) {
                this.form.strategy_list.splice(index, 1);
            },
            addStrategyItem(index) {
                var stock_symbol = '';
                if (this.form.strategy_type == 2) {
                    var stock_symbol = this.form.strategy_list[0].stock_symbol;
                }

                this.form.strategy_list.push({
                    stock_symbol:stock_symbol,
                    stock_ktype:'',
                    strategy_name:'',
                });

            }
        },
        computed:{

        }
    }
</script>

<style src="../../../static/css/datasource.css"></style>
<style>
    .rad-group{margin-bottom:20px;}
    .handle-input{  width: 300px;  display: inline-block;  }
    .handle-box2{display:inline-block;float:right;}
    /*.el-table_1_column_5{color:#eb9e05;}*/
    .orange{color:#eb9e05;background-color:none;}
    .btn2{margin-bottom:5px;margin-left:0;}
    .diainp{width:217px;}
    .diainp2{width:400px;}
    .inp80{width:80px;}
    .inp100{width:100px;}
    .inp120{width:120px;}
    .inp150{width:140px;}
    .inp160{width:160px;}
    .inp180{width:180px;}
    .nowrap{white-space:nowrap;}
    .upload-demo .el-upload {
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .upload-demo .el-upload:hover {
        border-color: #409EFF;
    }
</style>
