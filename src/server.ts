function welcome(name: string) {
  console.log(`Welcome ${name}`);
  const user = {
    name: 'Tanvir Ahmed',
    email: 'tanvirahmed@gmail.com',
  };
  return user.name;
}

welcome('Tanvir Ahmed');
