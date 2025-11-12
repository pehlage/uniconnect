# Imagem base com SDK do .NET para build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copia o csproj e restaura dependências
COPY UniConnect.Server.csproj .
RUN dotnet restore

# Copia o restante do código e publica
COPY . .
RUN dotnet publish -c Release -o /app

# Imagem final para execução
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app .
EXPOSE 10000
ENTRYPOINT ["dotnet", "UniConnect.Server.dll"]
