minimvc
=======

Tiny kernel Pure MVC inspired javascript prototype based pattern explorer of might, doom and peril


Usage
=====

**1. init the kernel**
> var mvc = new MiniMVC() 

**2. create modules**
var frontend = mvc.get('Module', 'Frontend')
var backend = mvc.get('Module', 'Backend')

**3. init patterns**
> var controller = frontend.get('Controller')
> var model = frontend.get('Model')
> var view = frontend.get('View')

**4. define a command**
> var command = controller.get('Command', 'MyCommand')
> command.execute = function(note, origin) {
>   console.info('Executed notification from command', note.data())
> }

**5. define a proxy**
> var proxy = model.get('Proxy', 'MyProxy')
> proxy.data('key', 'value v1')
> proxy.data({'key1': 'value v1', 'key2': 'value v3'})

**6. define a mediator**
> var mediator = view.get('Mediator', 'MyMediator')

**7. Create a notification(last parameter is true, this instances will not be persisted)**
> var notification = frontend.get('Notification', 'MyNotification', true)

**8. Handle notifications inside module's patterns**
> controller.handle(notification).through(command)
> proxy.handle(notification).through(function(note, origin) { console.info('Executed notification from callback(proxy)', note.data()) })
> mediator.handle(notification).through(function(note, origin) { console.info('Executed notification from callback(mediator)', note.data()) })

**9. Handle notification from other module**
> backend.handle(notification).through(function(note, origin) { console.info('Executed notification from backend module', note.data()) })

**10. Route the notification (no param, to originating module only, in this case frontend module)**
> notification.route()

**11. Route the notification to all modules**
> notification.route("*")

**12. Route the notification to one module (non originating)**
> notification.route(backend.type)