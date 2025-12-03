## Описание

Модуль [AsyncAPI](https://www.asyncapi.com/) для [Nest](https://github.com/nestjs/nest).

Генерация документации [AsyncAPI v3.0.0](https://www.asyncapi.com/) (для событийно-ориентированных сервисов, таких как websockets) аналогично
тому, как это делается в [nestjs/swagger](https://github.com/nestjs/swagger).

Этот модуль генерирует спецификацию AsyncAPI в формате **версии 3.0.0**, которая вводит новую структуру с отдельными определениями `operations` и `channels`, обеспечивая большую гибкость и лучшую организацию событийно-ориентированных API.

> **Примечание**: Это форк оригинального проекта [nestjs-asyncapi](https://github.com/flamewow/nestjs-asyncapi), обновленный для поддержки AsyncAPI v3.0.0. Оригинальная версия поддерживает AsyncAPI v2.x.

### [Живой пример](https://flamewow.github.io/nestjs-asyncapi/live-preview)

[AsyncAPI Playground](https://playground.asyncapi.io/) - Тестируйте ваши спецификации AsyncAPI v3.0.0

## Установка

> **Важно**: Эта версия не опубликована в npm, так как является форком с поддержкой AsyncAPI v3.0.0. Установка производится из исходников.

### Установка из исходников

1. Клонируйте репозиторий:

```bash
$ git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ>
$ cd nestjs-asyncapi
```

2. Установите зависимости и соберите проект:

```bash
$ npm install
$ npm run build
```

3. В вашем проекте установите пакет локально:

```bash
$ npm install --save <ПУТЬ_К_КЛОНИРОВАННОМУ_РЕПОЗИТОРИЮ>
```

Или используйте прямой путь в `package.json`:

```json
{
  "dependencies": {
    "nestjs-asyncapi": "file:../path/to/nestjs-asyncapi"
  }
}
```

### Пропуск установки Chromium

Пакет nestjs-asyncapi не требует chromium (который требуется библиотекой asyncapi), поэтому вы можете пропустить установку chromium,
установив переменную окружения `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` перед установкой зависимостей:

```bash
$ PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
```

## Быстрый старт

Добавьте инициализацию AsyncAPI в вашу функцию bootstrap.

```typescript
async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const asyncApiOptions = new AsyncApiDocumentBuilder()
        .setTitle('Feline')
        .setDescription('Feline server description here')
        .setVersion('1.0')
        .setDefaultContentType('application/json')
        .addSecurity('user-password', {type: 'userPassword'})
        .addServer('feline-ws', {
            url: 'ws://localhost:3000',
            protocol: 'socket.io',
        })
        .build();

    const asyncapiDocument = await AsyncApiModule.createDocument(app, asyncApiOptions);
    await AsyncApiModule.setup(docRelPath, app, asyncapiDocument);

    // другие процедуры инициализации здесь

    return app.listen(3000);
}
```

Модуль AsyncAPI по умолчанию сканирует `Controllers` и `WebSocketGateway`.
В большинстве случаев вам не нужно добавлять дополнительные аннотации,
но если вам нужно определить операции AsyncAPI в классе, который не является контроллером или шлюзом, используйте декоратор класса `@AsyncApi()`.

### Определение каналов и сообщений

В AsyncAPI v3.0.0 каналы и сообщения определяются отдельно. Используйте декоратор `@AsyncApiChannel()` для определения каналов
и декоратор `@AsyncApiMessage()` для определения сообщений с их связанными каналами.

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';
import { AsyncApiChannel, AsyncApiMessage } from 'nestjs-asyncapi';

class CreateFelineDto {
    @ApiProperty()
    demo: string;
}

@Controller()
@AsyncApiChannel('create/feline')
class DemoController {
    @AsyncApiMessage({
        channel: 'create/feline',
        payload: CreateFelineDto,
        name: 'createFelineMessage',
        summary: 'Сообщение, отправляемое при создании нового кота',
    })
    async createFeline() {
        // логика здесь
    }
}
```

### Конфигурация каналов

Вы также можете настроить каналы с дополнительными опциями:

```typescript
@AsyncApiChannel({
    name: 'user/events',
    address: 'user/events',
    description: 'Канал для событий, связанных с пользователями',
})
class UserController {
    @AsyncApiMessage({
        channel: 'user/events',
        payload: UserEventDto,
    })
    async handleUserEvent() {
        // логика здесь
    }
}
```

## Возможности AsyncAPI v3.0.0

Этот модуль генерирует спецификацию AsyncAPI в формате версии 3.0.0, которая включает:

- **Отдельные операции и каналы**: Операции и каналы теперь определяются отдельно, обеспечивая лучшую организацию
- **Гибкие определения сообщений**: Сообщения могут быть определены независимо и ссылаться в каналах
- **Улучшенные компоненты**: Улучшенная структура компонентов для лучшей переиспользуемости
- **Обратная совместимость**: Хотя формат v3.0.0, API остается похожим на предыдущие версии

## API эндпоинты

После настройки доступны следующие эндпоинты:

- `GET /{docPath}-json` - Возвращает документ AsyncAPI в формате JSON
- `GET /{docPath}-yaml` - Возвращает документ AsyncAPI в формате YAML

## Дополнительные ресурсы

Для более подробных примеров, пожалуйста, ознакомьтесь с [примером приложения](https://github.com/flamewow/nestjs-asyncapi/tree/main/sample).

Узнайте больше об AsyncAPI v3.0.0:
- [Документация AsyncAPI](https://www.asyncapi.com/docs)
- [Миграция на AsyncAPI v3.0](https://www.asyncapi.com/docs/migration/migrating-to-v3)
- [Спецификация AsyncAPI v3.0.0](https://www.asyncapi.com/docs/specifications/v3.0.0)

---

<h5>Используете эту библиотеку и она вам нравится? Не стесняйтесь поставить звезду
на <a href="https://github.com/flamewow/nestjs-asyncapi">GitHub <span>★</span></a></h5>
